import { describe, expect, it } from 'vitest'
import { boundingBox, signedArea } from './geometry'
import { applyStep, FoldError, planStep, shareUvEdge } from './fold'
import { createSheet, faceArea } from './split'
import type { Face, FoldSpec, PaperState } from './types'

const sheet = createSheet()

/** Book fold: right half over onto the left half. */
const bookFold: FoldSpec = { kind: 'fold', line: [[0.5, 0], [0.5, 1]], direction: 'valley', moving: [0.9, 0.5] }

const totalArea = (state: PaperState) => state.faces.reduce((sum, f) => sum + faceArea(f), 0)
const bounds = (state: PaperState) => boundingBox(state.faces.flatMap((f) => f.xy))
const byUvX = (state: PaperState, test: (u: number) => boolean) =>
  state.faces.find((f) => f.uv.every(([u]) => test(u)))!
const isFrontUp = (face: Face) => signedArea(face.xy) > 0

describe('line folds', () => {
  it('folds the right half over the left half', () => {
    const state = applyStep(sheet, bookFold)

    expect(state.faces).toHaveLength(2)
    expect(bounds(state)).toEqual({ min: [0, 0], max: [0.5, 1] })

    const left = byUvX(state, (u) => u <= 0.5)
    const right = byUvX(state, (u) => u >= 0.5)
    expect(isFrontUp(left)).toBe(true)
    expect(isFrontUp(right)).toBe(false) // turned over: the back side shows
    expect(right.layer).toBeGreaterThan(left.layer) // valley: lands on top
  })

  it('puts a mountain fold underneath', () => {
    const state = applyStep(sheet, { ...bookFold, direction: 'mountain' })
    expect(byUvX(state, (u) => u >= 0.5).layer).toBeLessThan(byUvX(state, (u) => u <= 0.5).layer)
  })

  it('folds a triangle along the diagonal', () => {
    const state = applyStep(sheet, { kind: 'fold', line: [[0, 0], [1, 1]], direction: 'valley', moving: [0.9, 0.1] })
    expect(state.faces).toHaveLength(2)
    expect(state.faces.every((f) => f.xy.length === 3)).toBe(true)
    expect(bounds(state)).toEqual({ min: [0, 0], max: [1, 1] })
  })

  it('never loses or creates paper', () => {
    let state = applyStep(sheet, bookFold)
    state = applyStep(state, { kind: 'fold', line: [[0, 0.3], [1, 0.3]], direction: 'valley', moving: [0.25, 0.1] })
    state = applyStep(state, { kind: 'fold', line: [[0, 0.3], [0.5, 1]], direction: 'mountain', moving: [0.4, 0.4] })
    expect(totalArea(state)).toBeCloseTo(1, 9)
  })

  it('keeps layer numbers compact', () => {
    let state = applyStep(sheet, bookFold)
    state = applyStep(state, { kind: 'fold', line: [[0, 0.5], [1, 0.5]], direction: 'valley', moving: [0.25, 0.9] })
    expect(state.faces.map((f) => f.layer).sort()).toEqual([0, 1, 2, 3])
  })

  it('rejects a moving point on the fold line', () => {
    expect(() => applyStep(sheet, { ...bookFold, moving: [0.5, 0.2] })).toThrow(FoldError)
  })

  it('rejects a fold with no paper on the moving side', () => {
    expect(() => applyStep(sheet, { ...bookFold, line: [[2, 0], [2, 1]], moving: [3, 0.5] })).toThrow(/No paper/)
  })
})

describe('creases', () => {
  it('leaves the paper in place but cut along the crease', () => {
    const state = applyStep(sheet, { ...bookFold, kind: 'crease' })
    expect(state.faces).toHaveLength(2)
    expect(bounds(state)).toEqual({ min: [0, 0], max: [1, 1] })
    expect(state.faces.every(isFrontUp)).toBe(true)
  })

  it('animates there and back', () => {
    const { motion } = planStep(sheet, { ...bookFold, kind: 'crease' })
    expect(motion).toMatchObject({ type: 'hinge', returns: true })
  })
})

describe('top-layer folds', () => {
  const halved = applyStep(sheet, bookFold) // left half below, right half on top

  it('moves only the top layer under the finger', () => {
    // Fold the top layer's upper-left corner down.
    const plan = planStep(halved, {
      kind: 'fold',
      line: [[0, 0.8], [0.2, 1]],
      direction: 'valley',
      moving: [0.05, 0.98],
      layers: 'top',
    })
    expect(plan.moving.size).toBe(1)
    // The bottom layer was not creased, so it stays one face.
    expect(plan.after.faces).toHaveLength(3)
  })

  it('takes along layers joined to the grabbed one on the moving side', () => {
    // Below y = 0.5 both layers are joined at the book fold (x = 0.5 on the sheet).
    const plan = planStep(halved, {
      kind: 'fold',
      line: [[0, 0.5], [1, 0.5]],
      direction: 'valley',
      moving: [0.4, 0.2],
      layers: 'top',
    })
    expect(plan.moving.size).toBe(2)
  })
})

describe('shareUvEdge', () => {
  it('finds partially overlapping edges and ignores shared corners', () => {
    const face = (id: string, uv: Face['uv']): Face => ({ id, uv, xy: uv, layer: 0 })
    const left = face('l', [[0, 0], [0.5, 0], [0.5, 1], [0, 1]])
    const lowerRight = face('r', [[0.5, 0], [1, 0], [1, 0.3], [0.5, 0.3]])
    const corner = face('c', [[0.5, 1], [1, 1], [1, 1.5]])
    expect(shareUvEdge(left, lowerRight)).toBe(true)
    expect(shareUvEdge(left, corner)).toBe(false)
  })
})

describe('flip and rotate', () => {
  it('flips over the vertical centre line, reversing the layers', () => {
    const halved = applyStep(sheet, bookFold)
    const flipped = applyStep(halved, { kind: 'flip' })

    expect(bounds(flipped)).toEqual(bounds(halved))
    const topBefore = halved.faces.find((f) => f.layer === 1)!
    expect(flipped.faces.find((f) => f.id === topBefore.id)!.layer).toBe(0)
    expect(flipped.faces.every((f) => isFrontUp(f) !== isFrontUp(halved.faces.find((h) => h.id === f.id)!))).toBe(true)
  })

  it('rotates around the centre', () => {
    const halved = applyStep(sheet, bookFold)
    const rotated = applyStep(halved, { kind: 'rotate', angle: 90 })
    const box = bounds(rotated)
    expect(box.min[0]).toBeCloseTo(-0.25)
    expect(box.max[0]).toBeCloseTo(0.75)
    expect(box.min[1]).toBeCloseTo(0.25)
    expect(box.max[1]).toBeCloseTo(0.75)
  })
})
