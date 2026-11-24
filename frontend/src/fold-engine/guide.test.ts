import { describe, expect, it } from 'vitest'
import { planStep } from './fold'
import { foldGuide } from './guide'
import { createSheet } from './split'
import type { FoldSpec } from './types'

const sheet = createSheet()
const bookFold: FoldSpec = { kind: 'fold', line: [[0.5, 0.2], [0.5, 0.4]], direction: 'valley', moving: [0.9, 0.5] }

describe('foldGuide', () => {
  it('stretches the line across the paper, whatever points defined it', () => {
    const guide = foldGuide(planStep(sheet, bookFold))!
    const ys = guide.line.map(([, y]) => y).sort()
    expect(guide.line.every(([x]) => Math.abs(x - 0.5) < 1e-9)).toBe(true)
    expect(ys[0]).toBeCloseTo(0)
    expect(ys[1]).toBeCloseTo(1)
  })

  it('arcs from the moving side over to the other side', () => {
    const { arc } = foldGuide(planStep(sheet, bookFold))!
    const [first, middle, last] = [arc[0], arc[Math.floor(arc.length / 2)], arc[arc.length - 1]]
    expect(first[0]).toBeGreaterThan(0.5)
    expect(last[0]).toBeLessThan(0.5)
    expect(middle[2]).toBeGreaterThan(0) // valley: over the top
  })

  it('goes underneath for mountain folds', () => {
    const { arc } = foldGuide(planStep(sheet, { ...bookFold, direction: 'mountain' }))!
    expect(arc[Math.floor(arc.length / 2)][2]).toBeLessThan(0)
  })

  it('has nothing to show for flips and rotations', () => {
    expect(foldGuide(planStep(sheet, { kind: 'flip' }))).toBeNull()
    expect(foldGuide(planStep(sheet, { kind: 'rotate', angle: 90 }))).toBeNull()
  })
})
