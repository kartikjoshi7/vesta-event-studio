/**
 * @fileoverview EventWorkspaceContext definition.
 */

import { createContext } from 'react';
import type { UseEventWorkspaceReturn } from '../hooks/useEventWorkspace';

export const EventWorkspaceContext = createContext<UseEventWorkspaceReturn | null>(null);
