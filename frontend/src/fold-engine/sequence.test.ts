import { describe, expect, it } from 'vitest'
import { FoldError } from './fold'
import { poseFlat, poseStep } from './pose'
import { easeInOut, foldSequence, poseAt } from './sequence'
import type { FoldSpec } from './types'

const halfAndHalf: FoldSpec[] = [
  { kind: 'fold', line: [[0.5, 0], [0.5, 1]], direction: 'valley', moving: [0.9, 0.5] },
  { kind: 'fold', line: [[0, 0.5], [1, 0.5]], direction: 'valley', moving: [0.25, 0.9] },
]

describe('foldSequence', () => {
  it('has one state per step plus the blank sheet', () => {
    const { states, plans } = foldSequence(halfAndHalf)
    expect(states).toHaveLength(3)
    expect(plans).toHaveLength(2)
    expect(states[0].faces).toHaveLength(1)
    expect(states[2].faces).toHaveLength(4)
  })

  it('chains plans: each step starts where the previous one ended', () => {
    const { states, plans } = foldSequence(halfAndHalf)
    plans.forEach((plan, i) => expect(plan.after).toBe(states[i + 1]))
  })

  it('is deterministic', () => {
    expect(foldSequence(halfAndHalf)).toEqual(foldSequence(halfAndHalf))
  })

  it('names the failing step', () => {
    const broken: FoldSpec[] = [...halfAndHalf, { kind: 'fold', line: [[0, 0], [1, 1]], direction: 'valley', moving: [0.3, 0.3] }]
    expect(() => foldSequence(broken)).toThrow(FoldError)
    expect(() => foldSequence(broken)).toThrow(/^Step 3 \(fold\): The moving point/)
  })
})

describe('poseAt', () => {
  const sequence = foldSequence(halfAndHalf)

  it('shows flat states at whole positions', () => {
    expect(poseAt(sequence, 0)).toEqual(poseFlat(sequence.states[0]))
    expect(poseAt(sequence, 2)).toEqual(poseFlat(sequence.states[2]))
  })

  it('shows a step in progress between them', () => {
    const halfway = poseAt(sequence, 1.5, (t) => t)
    expect(halfway).toEqual(poseStep(sequence.plans[1], 0.5))
  })

  it('clamps to the ends of the sequence', () => {
    expect(poseAt(sequence, -1)).toEqual(poseAt(sequence, 0))
    expect(poseAt(sequence, 9)).toEqual(poseAt(sequence, 2))
  })
})

describe('easeInOut', () => {
  it('starts and ends at rest', () => {
    expect([easeInOut(0), easeInOut(0.5), easeInOut(1)]).toEqual([0, 0.5, 1])
  })
})
