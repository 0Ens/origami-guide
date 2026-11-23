import { describe, expect, it } from 'vitest'
import { convexOverlap, normalizeLayers, stackLevels } from './layers'
import type { Face, Vec2 } from './types'

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

const face = (id: string, xy: Vec2[], layer: number): Face => ({ id, uv: xy, xy, layer })

describe('convexOverlap', () => {
  it('detects overlapping squares', () => {
    expect(convexOverlap(rect(0, 0, 1, 1), rect(0.5, 0.5, 1.5, 1.5))).toBe(true)
  })

  it('does not count a shared edge or corner as overlap', () => {
    expect(convexOverlap(rect(0, 0, 1, 1), rect(1, 0, 2, 1))).toBe(false)
    expect(convexOverlap(rect(0, 0, 1, 1), rect(1, 1, 2, 2))).toBe(false)
  })

  it('separates triangles that only share a diagonal', () => {
    const lower: Vec2[] = [[0, 0], [1, 0], [1, 1]]
    const upper: Vec2[] = [[0, 0], [1, 1], [0, 1]]
    expect(convexOverlap(lower, upper)).toBe(false)
  })

  it('works for mirrored (clockwise) polygons', () => {
    expect(convexOverlap(rect(0, 0, 1, 1).reverse(), rect(0.2, 0.2, 0.4, 0.4))).toBe(true)
  })
})

describe('normalizeLayers', () => {
  it('renumbers to 0..n-1 keeping the order', () => {
    const faces = normalizeLayers([face('a', rect(0, 0, 1, 1), 7), face('b', rect(0, 0, 1, 1), -3), face('c', rect(0, 0, 1, 1), 2)])
    expect(faces.map((f) => [f.id, f.layer])).toEqual([['a', 2], ['b', 0], ['c', 1]])
  })
})

describe('stackLevels', () => {
  it('only lifts faces that rest on other paper', () => {
    const levels = stackLevels([
      face('left', rect(0, 0, 0.5, 1), 0),
      face('right', rect(0.5, 0, 1, 1), 1),
      face('flap', rect(0.5, 0, 1, 1), 2),
      face('tip', rect(0.6, 0.6, 0.9, 0.9), 3),
    ])
    expect(Object.fromEntries(levels)).toEqual({ left: 0, right: 0, flap: 1, tip: 2 })
  })
})
