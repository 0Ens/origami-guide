import { FoldError, planStep, type StepPlan } from './fold'
import { createSheet } from './split'
import type { FoldSpec, PaperState } from './types'

/**
 * A whole model, folded once up front. `states[0]` is the blank sheet and
 * `states[n]` the model after step n; `plans[n - 1]` animates the way from
 * `states[n - 1]` to `states[n]`. Stepping back and forth is then just an
 * index change, and every step is reproducible.
 */
export interface FoldSequence {
  readonly states: readonly PaperState[]
  readonly plans: readonly StepPlan[]
}

export function foldSequence(specs: readonly FoldSpec[]): FoldSequence {
  const states: PaperState[] = [createSheet()]
  const plans: StepPlan[] = []

  specs.forEach((spec, index) => {
    try {
      const plan = planStep(states[index], spec)
      plans.push(plan)
      states.push(plan.after)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new FoldError(`Step ${index + 1} (${spec.kind}): ${reason}`, { cause: error })
    }
  })

  return { states, plans }
}
