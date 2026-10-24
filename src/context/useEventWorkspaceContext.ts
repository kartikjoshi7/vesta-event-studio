/**
 * @fileoverview Consumer hook for EventWorkspaceContext.
 */

import { useContext } from 'react';
import { EventWorkspaceContext } from './eventWorkspaceContextDefinition';
import type { UseEventWorkspaceReturn } from '../hooks/useEventWorkspace';

export function useEventWorkspaceContext(): UseEventWorkspaceReturn {
  const context = useContext(EventWorkspaceContext);
  if (!context) {
    throw new Error(
      'useEventWorkspaceContext must be used within an <EventWorkspaceProvider>.',
    );
  }
  return context;
}
