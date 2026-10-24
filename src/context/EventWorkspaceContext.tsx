/**
 * @fileoverview React Context Provider for Vesta Event Studio Workspace.
 */

import React, { type ReactNode } from 'react';
import { useEventWorkspace, type UseEventWorkspaceReturn } from '../hooks/useEventWorkspace';
import { EventWorkspaceContext } from './eventWorkspaceContextDefinition';

export interface EventWorkspaceProviderProps {
  children: ReactNode;
  value?: UseEventWorkspaceReturn;
}

/**
 * Top-level Provider wrapping workspace tree.
 * Can either auto-instantiate the workspace or accept an external instance.
 */
export const EventWorkspaceProvider: React.FC<EventWorkspaceProviderProps> = ({
  children,
  value,
}) => {
  const defaultWorkspace = useEventWorkspace();
  const workspace = value ?? defaultWorkspace;

  return (
    <EventWorkspaceContext.Provider value={workspace}>
      {children}
    </EventWorkspaceContext.Provider>
  );
};
