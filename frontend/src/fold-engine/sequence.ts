import { FoldError, planStep, type StepPlan } from './fold'
import { poseFlat, poseStep, type FacePose } from './pose'
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

/** Smooth start and stop for a step's animation. */
export const easeInOut = (t: number): number => t * t * (3 - 2 * t)

/**
 * The model at a position along the sequence: whole numbers are the flat
 * states (0 = blank sheet), fractions are steps in progress, so 2.25 is a
 * quarter of the way through step 3.
 */
export function poseAt(sequence: FoldSequence, position: number, ease: (t: number) => number = easeInOut): FacePose[] {
  const last = sequence.plans.length
  const clamped = Math.min(last, Math.max(0, position))
  const index = Math.floor(clamped)
  const t = clamped - index
  if (index === last || t < 1e-6) return poseFlat(sequence.states[index])
  return poseStep(sequence.plans[index], ease(t))
}
