// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useVendorDomain } from './useVendorDomain';
import { allPersonas } from '../data/verticalPersonas';
import type { EventProject } from '../types/event';

describe('useVendorDomain Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const useTestVendorHarness = () => {
    const [project, setProject] = useState<EventProject>({ ...allPersonas[0] });
    const vendorDomain = useVendorDomain(setProject);
    return { project, ...vendorDomain };
  };

  it('toggles vendor vetting checklist item status', () => {
    const { result } = renderHook(() => useTestVendorHarness());
    const vendor = result.current.project.vendors[0];
    const checkItem = vendor.vettingChecklist[0];
    const initialStatus = checkItem.checked;

    act(() => {
      result.current.toggleVendorChecklistItem(vendor.id, checkItem.id);
    });

    const updatedVendor = result.current.project.vendors.find((v) => v.id === vendor.id);
    const updatedItem = updatedVendor?.vettingChecklist.find((c) => c.id === checkItem.id);
    expect(updatedItem?.checked).toBe(!initialStatus);
  });

  it('updates vendor procurement status and logs audit entry', () => {
    const { result } = renderHook(() => useTestVendorHarness());
    const vendor = result.current.project.vendors[0];

    act(() => {
      result.current.updateVendorStatus(vendor.id, 'booked');
    });

    const updatedVendor = result.current.project.vendors.find((v) => v.id === vendor.id);
    expect(updatedVendor?.status).toBe('booked');
    expect(result.current.project.decisionLogs[0].trigger).toContain(vendor.vendorName);
  });

  it('adds a new vendor with default vetting checklist items', () => {
    const { result } = renderHook(() => useTestVendorHarness());
    const initialCount = result.current.project.vendors.length;

    act(() => {
      result.current.addVendor({
        category: 'Live Music / DJ',
        vendorName: 'Acoustic Harmonies Trio',
        contactEmail: 'contact@acousticharmonies.com',
        estimatedCost: 65000,
        actualCost: 0,
        status: 'shortlisted',
        notes: 'Requested acoustic setlist for cocktail hour',
        vettingChecklist: [
          { id: 'v1', label: 'Audio equipment rider reviewed', checked: true },
          { id: 'v2', label: 'Contract signed', checked: false },
        ],
      });
    });

    expect(result.current.project.vendors.length).toBe(initialCount + 1);
    const added = result.current.project.vendors.find(
      (v) => v.vendorName === 'Acoustic Harmonies Trio',
    );
    expect(added).toBeDefined();
    expect(added?.estimatedCost).toBe(65000);
  });

  it('does not mutate state when toggling checklist of nonexistent vendor', () => {
    const { result } = renderHook(() => useTestVendorHarness());
    const vendorsBefore = JSON.stringify(result.current.project.vendors);

    act(() => {
      result.current.toggleVendorChecklistItem('fake-vendor-999', 'fake-item-999');
    });

    const vendorsAfter = JSON.stringify(result.current.project.vendors);
    expect(vendorsBefore).toBe(vendorsAfter);
  });
});
