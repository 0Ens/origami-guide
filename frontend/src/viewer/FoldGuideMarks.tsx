import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { foldGuide, poseFlat, type StepPlan } from '../fold-engine'

/** Ink for the fold line, and a blue that stands out on any paper colour for the arrow. */
const INK = '#1f2937'
const ARROW = '#2563eb'
/** Gap between the paper and the marks drawn over (or under) it. */
const LIFT = 0.006
const HEAD_LENGTH = 0.05

/**
 * The marks of a classic origami diagram, drawn on the paper before a fold:
 * a dashed fold line (long dashes for valley folds, short ones for
 * mountain folds) and an arrow showing where the flap goes.
 */
export function FoldGuideMarks({ plan }: { plan: StepPlan }) {
  const marks = useMemo(() => {
    const guide = foldGuide(plan)
    if (!guide || plan.motion.type !== 'hinge') return null

    const heights = poseFlat({ faces: plan.before }).flatMap((face) => face.vertices.map((v) => v[2]))
    const [bottom, top] = [Math.min(...heights) - LIFT, Math.max(...heights) + LIFT]

    const line = guide.line.map(([x, y]) => new Vector3(x, y, top))
    // Valley arrows arc over the paper; mountain arrows dip under it.
    const base = plan.motion.sign > 0 ? top : bottom
    const arc = guide.arc.map(([x, y, z]) => new Vector3(x, y, z + base))

    const tip = arc[arc.length - 1]
    const heading = tip.clone().sub(arc[arc.length - 3]).normalize()
    const head = {
      // A cone points along +y; turn it along the arrow and put its tip on the arc's end.
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), heading),
      position: tip.clone().addScaledVector(heading, -HEAD_LENGTH / 2),
    }
    const valley = plan.motion.sign > 0
    return { line, arc, head, valley }
  }, [plan])

  if (!marks) return null
  const { line, arc, head, valley } = marks

  return (
    <group>
      <Line
        points={line}
        color={INK}
        lineWidth={2}
        dashed
        dashSize={valley ? 0.04 : 0.015}
        gapSize={valley ? 0.025 : 0.015}
      />
      <Line points={arc.slice(0, -2)} color={ARROW} lineWidth={3} />
      <mesh position={head.position} quaternion={head.quaternion}>
        <coneGeometry args={[0.02, HEAD_LENGTH, 16]} />
        <meshBasicMaterial color={ARROW} />
      </mesh>
    </group>
  )
}
