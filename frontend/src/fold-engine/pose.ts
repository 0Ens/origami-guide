import { lerp, rotate2, rotateAroundLine } from './geometry'
import type { Motion, StepPlan } from './fold'
import { stackLevels } from './layers'
import type { Face, PaperState, Vec2, Vec3 } from './types'

/** Height of one sheet of paper, in sheet units (the sheet is 1 wide). */
export const LAYER_GAP = 0.002

/** Peak angle of a fold-and-unfold, a little short of flat so layers don't clash. */
const CREASE_PEAK = 0.95 * Math.PI

/** A face placed in 3D, ready to be turned into a mesh. */
export interface FacePose {
  readonly id: string
  /** Original sheet coordinates, for texturing and crease lines. */
  readonly uv: readonly Vec2[]
  /** Current position, same vertex order as `uv`. */
  readonly vertices: readonly Vec3[]
  /** Whether the face is moving in the current step. */
  readonly moving: boolean
}

/** A model at rest: every face flat on the table at its stack height. */
export function poseFlat(state: PaperState): FacePose[] {
  const levels = stackLevels(state.faces)
  return state.faces.map((face) => ({
    id: face.id,
    uv: face.uv,
    vertices: face.xy.map(([x, y]): Vec3 => [x, y, levels.get(face.id)! * LAYER_GAP]),
    moving: false,
  }))
}

/**
 * A step in progress: `t = 0` is the start of the step and `t = 1` its end.
 * Moving faces turn around the hinge from their flat positions, and every
 * face's height eases from its old stack level to its new one, so the
 * last frame matches `poseFlat(plan.after)` exactly.
 */
export function poseStep(plan: StepPlan, t: number): FacePose[] {
  const progress = Math.min(1, Math.max(0, t))
  const levelsBefore = stackLevels(plan.before)
  const levelsAfter = stackLevels(plan.after.faces)
  const transform = motionAt(plan.motion, progress)

  return plan.before.map((face: Face) => {
    const moving = plan.moving.has(face.id)
    const height = lerp(levelsBefore.get(face.id)!, levelsAfter.get(face.id)!, progress) * LAYER_GAP
    const vertices = face.xy.map((p): Vec3 => {
      const [x, y, z] = moving ? transform(p) : [p[0], p[1], 0]
      return [x, y, z + height]
    })
    return { id: face.id, uv: face.uv, vertices, moving }
  })
}

/** Where a point of a moving face is at `t`, before stacking height is added. */
function motionAt(motion: Motion, t: number): (p: Vec2) => Vec3 {
  switch (motion.type) {
    case 'hinge': {
      const angle = motion.sign * (motion.returns ? CREASE_PEAK * Math.sin(Math.PI * t) : Math.PI * t)
      return (p) => rotateAroundLine([p[0], p[1], 0], motion.line, angle)
    }
    case 'flip':
      return (p) => rotateAroundLine([p[0], p[1], 0], motion.axis, Math.PI * t)
    case 'rotate':
      return (p) => {
        const [x, y] = rotate2(p, motion.center, motion.radians * t)
        return [x, y, 0]
      }
  }
}
