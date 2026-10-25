/**
 * @fileoverview Deterministic context-aware decision engine facade for Vesta Event Studio.
 *
 * Re-exports decomposed modular engines:
 * - `rebalanceBudgetForContext` (budgetRebalancing.ts)
 * - `calculateEventReadiness` (readinessCalculator.ts)
 * - `generateContingencyPlan` (contingencyEngine.ts)
 */

export {
  rebalanceBudgetForContext,
  type RebalanceResult,
} from './engine/budgetRebalancing';

export {
  calculateEventReadiness,
  type ReadinessResult,
  type ReadinessScore,
} from './engine/readinessCalculator';

export {
  generateContingencyPlan,
  type ContingencyScenario,
  type ContingencyResult,
} from './engine/contingencyEngine';
