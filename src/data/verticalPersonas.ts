/**
 * @fileoverview Vertical personas and allocation rules barrel facade for Vesta Event Studio.
 */

import type { EventProject } from '../types/event';
import { weddingPersona } from './personas/weddingPersona';
import { birthdayPersona } from './personas/birthdayPersona';
import { communityPersona } from './personas/communityPersona';

export {
  type AllocationRule,
  type PersonaMeta,
  weddingAllocationRules,
  birthdayAllocationRules,
  communityAllocationRules,
  allocationRulesByVertical,
  personaMetadata,
} from './personas/personaRules';

export { weddingPersona } from './personas/weddingPersona';
export { birthdayPersona } from './personas/birthdayPersona';
export { communityPersona } from './personas/communityPersona';

export const allPersonas: EventProject[] = [
  weddingPersona,
  birthdayPersona,
  communityPersona,
];
