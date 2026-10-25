/**
 * @fileoverview Vendor Domain Hook for Vesta Event Studio.
 *
 * Manages vendor CRM records, status progression, checklist verification,
 * and cost commitments with decision audit logging.
 */

import { useCallback } from 'react';
import type { EventProject, VendorChecklistItem } from '../types/event';
import { sanitizeUserInput } from '../utils/security';

function uid(prefix: string = 'vendor'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface UseVendorDomainReturn {
  toggleVendorChecklistItem: (vendorId: string, checkId: string) => void;
  updateVendorStatus: (vendorId: string, status: VendorChecklistItem['status'], actualCost?: number) => void;
  addVendor: (vendor: Omit<VendorChecklistItem, 'id'>) => void;
}

export function useVendorDomain(
  updateActiveProject: (updater: (prev: EventProject) => EventProject) => void,
): UseVendorDomainReturn {
  // Toggle a specific checklist requirement for a vendor
  const toggleVendorChecklistItem = useCallback(
    (vendorId: string, checkId: string) => {
      updateActiveProject((current) => {
        const updatedVendors = current.vendors.map((vendor) => {
          if (vendor.id === vendorId) {
            return {
              ...vendor,
              vettingChecklist: vendor.vettingChecklist.map((c) =>
                c.id === checkId ? { ...c, checked: !c.checked } : c,
              ),
            };
          }
          return vendor;
        });

        return {
          ...current,
          vendors: updatedVendors,
        };
      });
    },
    [updateActiveProject],
  );

  // Update procurement status and actual expenditure for a vendor
  const updateVendorStatus = useCallback(
    (vendorId: string, status: VendorChecklistItem['status'], actualCost?: number) => {
      updateActiveProject((current) => {
        let vendorName = '';

        const updatedVendors = current.vendors.map((vendor) => {
          if (vendor.id === vendorId) {
            vendorName = vendor.vendorName;
            return {
              ...vendor,
              status,
              actualCost: actualCost !== undefined ? Math.max(0, actualCost) : vendor.actualCost,
            };
          }
          return vendor;
        });

        const newLogs = [...current.decisionLogs];
        if (status === 'booked' || status === 'paid') {
          newLogs.unshift({
            id: uid('cdl'),
            timestamp: nowIso(),
            trigger: `Vendor Milestones: ${vendorName}`,
            reasoning: `Procurement stage updated to ${status.toUpperCase()} for ${vendorName}.`,
            actionTaken: `Vendor committed to event registry.`,
            impactLevel: 'medium',
          });
        }

        return {
          ...current,
          vendors: updatedVendors,
          decisionLogs: newLogs,
        };
      });
    },
    [updateActiveProject],
  );

  // Register a new vendor into the active workspace CRM
  const addVendor = useCallback(
    (vendor: Omit<VendorChecklistItem, 'id'>) => {
      const newVendor: VendorChecklistItem = {
        ...vendor,
        id: uid('vendor'),
        category: sanitizeUserInput(vendor.category, 50),
        vendorName: sanitizeUserInput(vendor.vendorName, 80),
        contactEmail: sanitizeUserInput(vendor.contactEmail, 80),
        notes: sanitizeUserInput(vendor.notes, 200),
        estimatedCost: Math.max(0, vendor.estimatedCost),
        actualCost: vendor.actualCost !== undefined ? Math.max(0, vendor.actualCost) : undefined,
      };

      updateActiveProject((current) => ({
        ...current,
        vendors: [...current.vendors, newVendor],
      }));
    },
    [updateActiveProject],
  );

  return {
    toggleVendorChecklistItem,
    updateVendorStatus,
    addVendor,
  };
}
