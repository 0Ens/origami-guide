import { describe, expect, it } from 'vitest'
import { applyStep, planStep } from './fold'
import { LAYER_GAP, poseFlat, poseStep, type FacePose } from './pose'
import { createSheet } from './split'
import type { FoldSpec, PaperState } from './types'

const sheet = createSheet()
const bookFold: FoldSpec = { kind: 'fold', line: [[0.5, 0], [0.5, 1]], direction: 'valley', moving: [0.9, 0.5] }

/** Poses keyed by face id with vertices sorted, so different vertex orders compare equal. */
const normalized = (poses: FacePose[]) =>
  Object.fromEntries(poses.map((p) => [p.id, [...p.vertices].map((v) => v.map(round)).sort()]))

/** Rounds away float noise; `|| 0` turns -0 into 0. */
const round = (n: number) => Math.round(n * 1e9) / 1e9 || 0

const movingZs = (poses: FacePose[]) => poses.filter((p) => p.moving).flatMap((p) => p.vertices.map((v) => v[2]))

describe('poseFlat', () => {
  it('lifts each face by the paper under it', () => {
    const poses = poseFlat(applyStep(sheet, bookFold))
    const heights = poses.map((p) => p.vertices[0][2]).sort()
    expect(heights).toEqual([0, LAYER_GAP])
  })
})

describe('poseStep', () => {
  const cases: [string, PaperState, FoldSpec][] = [
    ['valley fold', sheet, bookFold],
    ['mountain fold', sheet, { ...bookFold, direction: 'mountain' }],
    ['flip', applyStep(sheet, bookFold), { kind: 'flip' }],
    ['rotation', applyStep(sheet, bookFold), { kind: 'rotate', angle: 45 }],
  ]

  it.each(cases)('starts and ends at the flat states (%s)', (_, state, spec) => {
    const plan = planStep(state, spec)
    expect(normalized(poseStep(plan, 0))).toEqual(normalized(poseFlat({ faces: plan.before })))
    expect(normalized(poseStep(plan, 1))).toEqual(normalized(poseFlat(plan.after)))
  })

  it('lifts a valley fold towards the viewer and drops a mountain fold away', () => {
    const valley = poseStep(planStep(sheet, bookFold), 0.5)
    const mountain = poseStep(planStep(sheet, { ...bookFold, direction: 'mountain' }), 0.5)
    expect(Math.max(...movingZs(valley))).toBeCloseTo(0.5, 2)
    expect(Math.min(...movingZs(mountain))).toBeCloseTo(-0.5, 2)
  })

  it('returns a crease to where it started', () => {
    const plan = planStep(sheet, { ...bookFold, kind: 'crease' })
    expect(Math.max(...movingZs(poseStep(plan, 0.5)))).toBeGreaterThan(0)
    expect(normalized(poseStep(plan, 1))).toEqual(normalized(poseStep(plan, 0)))
  })

  it('clamps t to the step', () => {
    const plan = planStep(sheet, bookFold)
    expect(poseStep(plan, 1.7)).toEqual(poseStep(plan, 1))
  })
})
