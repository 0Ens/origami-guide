import { add, dot, lerp2, rotateAroundLine, scale, signedDistance, sub, type Line } from './geometry'
import type { StepPlan } from './fold'
import type { Vec2, Vec3 } from './types'

/** How far the arrow reaches from the fold line at most, in sheet units. */
const MAX_ARROW_REACH = 0.3
const ARC_SEGMENTS = 24

/** What to draw so a step can be read before it happens. */
export interface FoldGuide {
  /** The part of the fold line that crosses paper. */
  readonly line: readonly [Vec2, Vec2]
  /** Path of the arrow, from the moving side over (or under) the hinge to where it lands. */
  readonly arc: readonly Vec3[]
}

/** A guide for line folds and creases; flips and rotations need none. */
export function foldGuide(plan: StepPlan): FoldGuide | null {
  const { motion } = plan
  if (motion.type !== 'hinge') return null

  const line = motion.line
  const span = crossingSpan(line, plan.before.flatMap((face) => edgesOf(face.xy)))
  if (!span) return null

  const ends: [Vec2, Vec2] = [pointAt(line, span[0]), pointAt(line, span[1])]

  // The arrow starts beside the middle of the fold line, on the moving side.
  const movingPoints = plan.before.filter((f) => plan.moving.has(f.id)).flatMap((f) => f.xy)
  const reach = Math.min(MAX_ARROW_REACH, Math.max(...movingPoints.map((p) => Math.abs(signedDistance(line, p)))) * 0.6)
  const side = Math.sign(signedDistance(line, movingPoints[0]) || signedDistance(line, movingPoints[1]))
  const start = add(lerp2(ends[0], ends[1], 0.5), scale(line.normal, side * reach))

  // Sweep it the way the paper goes: up for valley folds, down for mountain folds.
  const arc = Array.from({ length: ARC_SEGMENTS + 1 }, (_, i) =>
    rotateAroundLine([start[0], start[1], 0], line, (motion.sign * Math.PI * i) / ARC_SEGMENTS),
  )
  return { line: ends, arc }
}

const pointAt = (line: Line, s: number): Vec2 => add(line.origin, scale(line.direction, s))

function edgesOf(polygon: readonly Vec2[]): [Vec2, Vec2][] {
  return polygon.map((p, i) => [p, polygon[(i + 1) % polygon.length]])
}

/** The range along the line (as distances from its origin) where it crosses the given edges. */
function crossingSpan(line: Line, edges: readonly [Vec2, Vec2][]): [number, number] | null {
  let [min, max] = [Infinity, -Infinity]
  for (const [a, b] of edges) {
    const [da, db] = [signedDistance(line, a), signedDistance(line, b)]
    if (da * db > 0 || da === db) continue // edge entirely on one side, or along the line
    const hit = lerp2(a, b, da / (da - db))
    const s = dot(sub(hit, line.origin), line.direction)
    min = Math.min(min, s)
    max = Math.max(max, s)
  }
  return max - min > 1e-9 ? [min, max] : null
}
