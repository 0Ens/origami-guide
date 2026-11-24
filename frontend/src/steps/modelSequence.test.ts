import { describe, expect, it } from 'vitest'
import type { Step } from '../api/types'
import { modelSequence } from './modelSequence'

const step = (number: number, fold: unknown): Step => ({ number, instruction: `Step ${number}`, fold })
const bookFold = { kind: 'fold', line: [[0.5, 0], [0.5, 1]], direction: 'valley', moving: [0.75, 0.5] }

describe('modelSequence', () => {
  it('folds valid steps into a sequence', () => {
    const result = modelSequence([step(1, bookFold), step(2, { kind: 'flip' })])
    expect(result.ok && result.sequence.plans.length).toBe(2)
  })

  it('gives an empty sequence for a model without steps', () => {
    const result = modelSequence([])
    expect(result.ok && result.sequence.states.length).toBe(1)
  })

  it('names the step with malformed fold data', () => {
    const result = modelSequence([step(1, bookFold), step(2, { kind: 'fold', direction: 'sideways' })])
    expect(result).toEqual({ ok: false, reason: expect.stringMatching(/^Step 2: .*direction/) })
  })

  it('names the step that cannot be folded', () => {
    const nothingMoves = { ...bookFold, moving: [-0.5, 0.5], line: [[-0.2, 0], [-0.2, 1]] }
    const result = modelSequence([step(1, nothingMoves)])
    expect(result).toEqual({ ok: false, reason: expect.stringMatching(/^Step 1/) })
  })
})
