import { describe, expect, it } from 'vitest'
import { lineThrough } from './geometry'
import { createSheet, faceArea, splitFace } from './split'
import type { Face } from './types'

const [sheet] = createSheet().faces

describe('splitFace', () => {
  it('cuts the sheet along the vertical centre line into two halves', () => {
    const { positive, negative } = splitFace(sheet, lineThrough([0.5, 0], [0.5, 1]))

    // The upward line has the left half (x < 0.5) on its positive side.
    expect(positive?.xy).toEqual([[0, 0], [0.5, 0], [0.5, 1], [0, 1]])
    expect(negative?.xy).toEqual([[0.5, 0], [1, 0], [1, 1], [0.5, 1]])
    expect(faceArea(positive!)).toBeCloseTo(0.5)
    expect(faceArea(negative!)).toBeCloseTo(0.5)
  })

  it('cuts along the diagonal through two corners without adding vertices', () => {
    const { positive, negative } = splitFace(sheet, lineThrough([0, 0], [1, 1]))

    expect(positive?.xy).toHaveLength(3)
    expect(negative?.xy).toHaveLength(3)
    expect(positive?.xy).toContainEqual([0, 1])
    expect(negative?.xy).toContainEqual([1, 0])
  })

  it('derives child ids from the parent id', () => {
    const { positive, negative } = splitFace(sheet, lineThrough([0, 0.5], [1, 0.5]))
    expect(positive?.id).toBe('f.0')
    expect(negative?.id).toBe('f.1')
  })

  it('returns the face whole when the line misses or only touches it', () => {
    expect(splitFace(sheet, lineThrough([2, 0], [2, 1]))).toEqual({ positive: sheet })
    expect(splitFace(sheet, lineThrough([1, 0], [1, 1]))).toEqual({ positive: sheet })
    expect(splitFace(sheet, lineThrough([0, 0], [0, 1]))).toEqual({ negative: sheet })
  })

  it('keeps uv and xy in step when the face has been moved', () => {
    // The left half of the sheet, mirrored onto the right (as after a book fold).
    const moved: Face = {
      id: 'm',
      uv: [[0, 0], [0.5, 0], [0.5, 1], [0, 1]],
      xy: [[1, 0], [0.5, 0], [0.5, 1], [1, 1]],
      layer: 1,
    }
    const { positive, negative } = splitFace(moved, lineThrough([0, 0.25], [1, 0.25]))

    // Above the line: the uv part must also be the upper part of the original strip.
    expect(positive?.uv.every(([, v]) => v >= 0.25 - 1e-9)).toBe(true)
    expect(negative?.uv.every(([, v]) => v <= 0.25 + 1e-9)).toBe(true)
    expect(faceArea(positive!)).toBeCloseTo(0.375)
    expect(faceArea(negative!)).toBeCloseTo(0.125)
    expect(positive?.layer).toBe(1)
  })
})
