import { dot, EPSILON, sub } from './geometry'
import type { Face, Vec2 } from './types'

/** Orders faces bottom to top; ties are broken by id so results are deterministic. */
export const byLayer = (a: Face, b: Face): number => a.layer - b.layer || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

/** Renumbers layers to 0..n-1 keeping their order, so numbers don't grow with every fold. */
export function normalizeLayers(faces: readonly Face[]): Face[] {
  const rank = new Map([...faces].sort(byLayer).map((face, i) => [face.id, i]))
  return faces.map((face) => ({ ...face, layer: rank.get(face.id)! }))
}

/**
 * Separating axis test: two convex polygons overlap with positive area
 * unless some edge normal separates their projections. Shared edges or
 * corners don't count as overlap.
 */
export function convexOverlap(a: readonly Vec2[], b: readonly Vec2[]): boolean {
  for (const polygon of [a, b]) {
    for (let i = 0; i < polygon.length; i++) {
      const edge = sub(polygon[(i + 1) % polygon.length], polygon[i])
      const axis: Vec2 = [-edge[1], edge[0]]
      const [minA, maxA] = project(a, axis)
      const [minB, maxB] = project(b, axis)
      if (maxA <= minB + EPSILON || maxB <= minA + EPSILON) return false
    }
  }
  return true
}

function project(polygon: readonly Vec2[], axis: Vec2): [number, number] {
  const values = polygon.map((p) => dot(p, axis))
  return [Math.min(...values), Math.max(...values)]
}

/**
 * How many sheets of paper lie under each face, counted only where they
 * actually overlap. A face resting on nothing gets level 0. Rendering
 * uses this as height, so a stack is only as thick as it really is.
 */
export function stackLevels(faces: readonly Face[]): Map<string, number> {
  const levels = new Map<string, number>()
  const placed: Face[] = []
  for (const face of [...faces].sort(byLayer)) {
    let level = 0
    for (const below of placed) {
      if (convexOverlap(face.xy, below.xy)) level = Math.max(level, levels.get(below.id)! + 1)
    }
    levels.set(face.id, level)
    placed.push(face)
  }
  return levels
}
