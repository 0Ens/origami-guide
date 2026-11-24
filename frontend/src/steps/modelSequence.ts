import type { Step } from '../api/types'
import { FoldError, foldSequence, parseFoldSpec, type FoldSequence } from '../fold-engine'

export type ModelSequence = { ok: true; sequence: FoldSequence } | { ok: false; reason: string }

/**
 * Checks and folds a model's steps as they come from the API.
 *
 * Bad fold data is a content bug, not a reason to break the page: the
 * caller gets the reason (for the console) and can still show the written
 * instructions. Anything that is not a FoldError is a real bug and is
 * rethrown.
 */
export function modelSequence(steps: readonly Step[]): ModelSequence {
  try {
    const specs = steps.map((step) => {
      try {
        return parseFoldSpec(step.fold)
      } catch (error) {
        if (!(error instanceof FoldError)) throw error
        throw new FoldError(`Step ${step.number}: ${error.message}`, { cause: error })
      }
    })
    return { ok: true, sequence: foldSequence(specs) }
  } catch (error) {
    if (error instanceof FoldError) return { ok: false, reason: error.message }
    throw error
  }
}
