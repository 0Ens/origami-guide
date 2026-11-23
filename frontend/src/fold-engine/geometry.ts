import type { Vec2, Vec3 } from './types'

/** Tolerance for "is this point on the line" style comparisons. */
export const EPSILON = 1e-7

export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]
export const scale = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k]
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1]
/** z component of the 3D cross product; > 0 when `b` is counter-clockwise of `a`. */
export const cross = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0]
export const length = (a: Vec2): number => Math.hypot(a[0], a[1])
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const lerp2 = (a: Vec2, b: Vec2, t: number): Vec2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
export const nearlyEqual = (a: Vec2, b: Vec2, eps = EPSILON): boolean =>
  Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps

/** Shoelace formula: positive for counter-clockwise polygons. */
export function signedArea(polygon: readonly Vec2[]): number {
  let sum = 0
  for (let i = 0; i < polygon.length; i++) {
    sum += cross(polygon[i], polygon[(i + 1) % polygon.length])
  }
  return sum / 2
}

export function centroid(polygon: readonly Vec2[]): Vec2 {
  // Vertex average is enough here: it is always inside a convex polygon.
  const sum = polygon.reduce<Vec2>((acc, p) => add(acc, p), [0, 0])
  return scale(sum, 1 / polygon.length)
}

/** True when `p` lies inside or on the boundary of a counter-clockwise or clockwise convex polygon. */
export function containsPoint(polygon: readonly Vec2[], p: Vec2): boolean {
  const orientation = Math.sign(signedArea(polygon))
  return polygon.every((a, i) => {
    const b = polygon[(i + 1) % polygon.length]
    return cross(sub(b, a), sub(p, a)) * orientation >= -EPSILON
  })
}

export interface BoundingBox {
  readonly min: Vec2
  readonly max: Vec2
}

export function boundingBox(points: Iterable<Vec2>): BoundingBox {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of points) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return { min: [minX, minY], max: [maxX, maxY] }
}

export const boxCenter = (box: BoundingBox): Vec2 => lerp2(box.min, box.max, 0.5)

/** Rotates `p` counter-clockwise around `center`. */
export function rotate2(p: Vec2, center: Vec2, radians: number): Vec2 {
  const [x, y] = sub(p, center)
  const [c, s] = [Math.cos(radians), Math.sin(radians)]
  return add(center, [x * c - y * s, x * s + y * c])
}

/**
 * An infinite line through `origin` with unit `direction`. `normal` is the
 * direction rotated 90° counter-clockwise, so points with a positive
 * signed distance lie to the left of the line.
 */
export interface Line {
  readonly origin: Vec2
  readonly direction: Vec2
  readonly normal: Vec2
}

export function lineThrough(a: Vec2, b: Vec2): Line {
  const d = sub(b, a)
  const len = length(d)
  if (len < EPSILON) {
    throw new Error(`A fold line needs two distinct points, got [${a}] twice`)
  }
  const direction: Vec2 = [d[0] / len, d[1] / len]
  return { origin: a, direction, normal: [-direction[1], direction[0]] }
}

export const signedDistance = (line: Line, p: Vec2): number => dot(line.normal, sub(p, line.origin))

/** -1, 0 or 1: which side of the line `p` is on, treating near-misses as "on the line". */
export function sideOf(line: Line, p: Vec2): -1 | 0 | 1 {
  const d = signedDistance(line, p)
  return Math.abs(d) <= EPSILON ? 0 : d > 0 ? 1 : -1
}

/** Mirror image of `p` across the line. */
export const reflect = (line: Line, p: Vec2): Vec2 => sub(p, scale(line.normal, 2 * signedDistance(line, p)))

/**
 * Rotates a 3D point around an axis lying in the table plane (z = 0), using
 * the right-hand rule: a positive angle lifts the left side of the line (+z).
 */
export function rotateAroundLine(p: Vec3, line: Line, radians: number): Vec3 {
  // Decompose relative to the axis: along the direction, along the normal, and along z.
  const rel: Vec2 = [p[0] - line.origin[0], p[1] - line.origin[1]]
  const along = dot(rel, line.direction)
  const across = dot(rel, line.normal)
  const [c, s] = [Math.cos(radians), Math.sin(radians)]
  // In the (normal, z) plane the point turns like a 2D vector.
  const across2 = across * c - p[2] * s
  const z2 = across * s + p[2] * c
  return [
    line.origin[0] + line.direction[0] * along + line.normal[0] * across2,
    line.origin[1] + line.direction[1] * along + line.normal[1] * across2,
    z2,
  ]
}
