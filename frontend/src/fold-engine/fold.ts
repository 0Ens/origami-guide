import {
  boundingBox,
  boxCenter,
  containsPoint,
  cross,
  dot,
  EPSILON,
  lineThrough,
  reflect,
  rotate2,
  sideOf,
  sub,
  type Line,
} from './geometry'
import { byLayer, normalizeLayers } from './layers'
import { splitFace } from './split'
import type { Face, FoldSpec, LineFoldSpec, PaperState, Vec2 } from './types'

/** How the moving faces travel during a step; used to animate it. */
export type Motion =
  /** Rotate around a fold line; `sign` is +1 when the moving side lifts towards the viewer. */
  | { readonly type: 'hinge'; readonly line: Line; readonly sign: 1 | -1; readonly returns: boolean }
  /** Turn over around a vertical axis through the model's centre. */
  | { readonly type: 'flip'; readonly axis: Line }
  /** Spin in the table plane. */
  | { readonly type: 'rotate'; readonly center: Vec2; readonly radians: number }

/**
 * Everything needed to show a step: the faces at its start (already cut
 * along the fold line), which of them move and how, and the flat state
 * it ends in. Both the final state and the animation come from one plan,
 * so they cannot disagree.
 */
export interface StepPlan {
  readonly before: readonly Face[]
  readonly moving: ReadonlySet<string>
  readonly motion: Motion
  readonly after: PaperState
}

export class FoldError extends Error {
  override name = 'FoldError'
}

export function planStep(state: PaperState, spec: FoldSpec): StepPlan {
  switch (spec.kind) {
    case 'fold':
    case 'crease':
      return planLineFold(state, spec)
    case 'flip':
      return planFlip(state)
    case 'rotate':
      return planRotate(state, spec.angle)
  }
}

/** The flat state after a step. */
export const applyStep = (state: PaperState, spec: FoldSpec): PaperState => planStep(state, spec).after

function planLineFold(state: PaperState, spec: LineFoldSpec): StepPlan {
  const line = lineThrough(spec.line[0], spec.line[1])
  const side = sideOf(line, spec.moving)
  if (side === 0) {
    throw new FoldError(`The moving point [${spec.moving}] lies on the fold line`)
  }

  // 1. Cut every face along the line, remembering where each piece came from.
  const pieces: { piece: Face; parent: Face; onMovingSide: boolean }[] = []
  for (const parent of state.faces) {
    const { positive, negative } = splitFace(parent, line)
    if (positive) pieces.push({ piece: positive, parent, onMovingSide: side === 1 })
    if (negative) pieces.push({ piece: negative, parent, onMovingSide: side === -1 })
  }

  // 2. Decide which pieces move.
  const candidates = pieces.filter((p) => p.onMovingSide).map((p) => p.piece)
  const moving = spec.layers === 'top' ? attachedToTopLayer(candidates, spec.moving) : new Set(candidates.map((f) => f.id))
  if (moving.size === 0) {
    throw new FoldError('No paper lies on the moving side of the fold line')
  }

  // 3. Undo cuts that didn't matter: a face keeps its crease only if part of it moves.
  const movedParents = new Set(pieces.filter((p) => moving.has(p.piece.id)).map((p) => p.parent.id))
  const before: Face[] = []
  for (const { piece, parent } of pieces) {
    const wasCut = piece.id !== parent.id
    if (!wasCut || movedParents.has(parent.id)) before.push(piece)
    else if (!before.includes(parent)) before.push(parent)
  }

  const valley = spec.direction === 'valley'
  const motion: Motion = { type: 'hinge', line, sign: (valley ? side : -side) as 1 | -1, returns: spec.kind === 'crease' }

  if (spec.kind === 'crease') {
    return { before, moving, motion, after: { faces: before } }
  }

  // 4. Mirror the moving faces across the line. A valley fold lands them on top
  //    of everything, a mountain fold underneath; either way their own order flips.
  const layers = before.map((f) => f.layer)
  const movingLayers = before.filter((f) => moving.has(f.id)).map((f) => f.layer)
  const [minAll, maxAll] = [Math.min(...layers), Math.max(...layers)]
  const [minMoving, maxMoving] = [Math.min(...movingLayers), Math.max(...movingLayers)]

  const folded = before.map((face) => {
    if (!moving.has(face.id)) return face
    return {
      ...face,
      xy: face.xy.map((p) => reflect(line, p)),
      layer: valley ? maxAll + 1 + (maxMoving - face.layer) : minAll - 1 - (face.layer - minMoving),
    }
  })

  return { before, moving, motion, after: { faces: normalizeLayers(folded) } }
}

/**
 * The paper a fold of the top layer takes along: start with the topmost
 * piece under the finger, then follow paper connections (shared edges on
 * the original sheet) without crossing the fold line.
 */
function attachedToTopLayer(candidates: readonly Face[], finger: Vec2): Set<string> {
  const grabbed = [...candidates].sort(byLayer).reverse().find((f) => containsPoint(f.xy, finger))
  if (!grabbed) return new Set()

  const moving = new Set([grabbed.id])
  const queue = [grabbed]
  while (queue.length > 0) {
    const current = queue.pop()!
    for (const other of candidates) {
      if (!moving.has(other.id) && shareUvEdge(current, other)) {
        moving.add(other.id)
        queue.push(other)
      }
    }
  }
  return moving
}

/** True when two faces are joined along a stretch of edge on the original sheet. */
export function shareUvEdge(a: Face, b: Face): boolean {
  for (let i = 0; i < a.uv.length; i++) {
    const [p, q] = [a.uv[i], a.uv[(i + 1) % a.uv.length]]
    const edge = sub(q, p)
    const len2 = dot(edge, edge)
    for (let j = 0; j < b.uv.length; j++) {
      const [r, s] = [b.uv[j], b.uv[(j + 1) % b.uv.length]]
      // Both ends of b's edge must be on a's edge line...
      const collinear =
        Math.abs(cross(edge, sub(r, p))) <= EPSILON * Math.sqrt(len2) &&
        Math.abs(cross(edge, sub(s, p))) <= EPSILON * Math.sqrt(len2)
      if (!collinear) continue
      // ...and the two segments must overlap by more than a point.
      const [t0, t1] = [dot(sub(r, p), edge) / len2, dot(sub(s, p), edge) / len2]
      const overlap = Math.min(1, Math.max(t0, t1)) - Math.max(0, Math.min(t0, t1))
      if (overlap * Math.sqrt(len2) > EPSILON) return true
    }
  }
  return false
}

function planFlip(state: PaperState): StepPlan {
  const [cx] = boxCenter(boundingBox(state.faces.flatMap((f) => f.xy)))
  const axis = lineThrough([cx, 0], [cx, 1])
  const flipped = state.faces.map((face) => ({
    ...face,
    xy: face.xy.map(([x, y]): Vec2 => [2 * cx - x, y]),
    layer: -face.layer,
  }))
  return {
    before: state.faces,
    moving: new Set(state.faces.map((f) => f.id)),
    motion: { type: 'flip', axis },
    after: { faces: normalizeLayers(flipped) },
  }
}

function planRotate(state: PaperState, degrees: number): StepPlan {
  const center = boxCenter(boundingBox(state.faces.flatMap((f) => f.xy)))
  const radians = (degrees * Math.PI) / 180
  return {
    before: state.faces,
    moving: new Set(state.faces.map((f) => f.id)),
    motion: { type: 'rotate', center, radians },
    after: { faces: state.faces.map((face) => ({ ...face, xy: face.xy.map((p) => rotate2(p, center, radians)) })) },
  }
}
