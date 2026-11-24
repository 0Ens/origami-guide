import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BackSide, BufferAttribute, BufferGeometry, FrontSide, type Group } from 'three'
import { poseAt, type FoldSequence } from '../fold-engine'
import { approach } from './animation'
import { FoldGuideMarks } from './FoldGuideMarks'
import { paperBuffers } from './paperBuffers'
import { useReducedMotion } from './useReducedMotion'

interface PaperProps {
  sequence: FoldSequence
  /** Position to move to: whole numbers are steps, fractions stop mid-fold. */
  target: number
  frontColor: string
  backColor: string
}

/**
 * The sheet. One geometry is drawn twice: the front material only shows
 * triangles facing the camera and the back material only the others. As
 * triangles always face out of the sheet's front, a folded-over flap shows
 * its back colour without the paper having any thickness.
 *
 * The paper glides toward `target` frame by frame. That work happens in
 * useFrame and writes straight into GPU buffers: re-rendering React 60
 * times a second would be far slower and is not needed.
 */
export function Paper({ sequence, target, frontColor, backColor }: PaperProps) {
  const surface = useMemo(() => new BufferGeometry(), [])
  const outline = useMemo(() => new BufferGeometry(), [])
  const centred = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const reducedMotion = useReducedMotion()

  const goal = Math.min(sequence.plans.length, Math.max(0, target))
  const position = useRef(goal)
  const drawn = useRef<{ sequence: FoldSequence; position: number } | null>(null)
  // The step the paper rests on, or null while it moves. Drives the fold guide.
  const [resting, setResting] = useState<number | null>(null)

  useEffect(() => () => [surface, outline].forEach((geometry) => geometry.dispose()), [surface, outline])

  // With on-demand rendering, a new target has to ask for the first frame itself.
  useEffect(() => invalidate(), [goal, sequence, invalidate])

  useFrame((_, delta) => {
    // A different model starts where it was asked to, without playing every step.
    if (drawn.current && drawn.current.sequence !== sequence) position.current = goal
    position.current = reducedMotion ? goal : approach(position.current, goal, delta)

    if (drawn.current?.sequence !== sequence || drawn.current.position !== position.current) {
      const buffers = paperBuffers(poseAt(sequence, position.current))
      writePositions(surface, buffers.triangles)
      surface.computeVertexNormals()
      writePositions(outline, buffers.edges)
      centred.current?.position.set(-buffers.center[0], -buffers.center[1], 0)
      drawn.current = { sequence, position: position.current }
    }

    if (position.current !== goal) invalidate()

    // React state only changes when the paper starts or stops, not every frame.
    const rest = position.current === goal && Number.isInteger(goal) ? goal : null
    if (rest !== resting) setResting(rest)
  })

  const nextPlan = resting === null ? undefined : sequence.plans[resting]

  return (
    // The engine works in the XY plane with +z up; three.js has +y up. Lay the sheet on the table.
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <group ref={centred}>
        <mesh geometry={surface}>
          <meshStandardMaterial color={frontColor} side={FrontSide} roughness={0.9} {...pushedBack} />
        </mesh>
        <mesh geometry={surface}>
          <meshStandardMaterial color={backColor} side={BackSide} roughness={0.9} {...pushedBack} />
        </mesh>
        <lineSegments geometry={outline}>
          <lineBasicMaterial color="#000000" transparent opacity={0.25} />
        </lineSegments>
        {nextPlan && <FoldGuideMarks plan={nextPlan} />}
      </group>
    </group>
  )
}

/** Moves the surface a hair back in the depth buffer so edges drawn on it stay visible. */
const pushedBack = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }

/** Reuses the GPU buffer when the size is unchanged; folds that split faces need a new one. */
function writePositions(geometry: BufferGeometry, data: Float32Array) {
  const current = geometry.getAttribute('position') as BufferAttribute | undefined
  if (current && current.array.length === data.length) {
    current.copyArray(data)
    current.needsUpdate = true
  } else {
    geometry.dispose()
    geometry.deleteAttribute('normal') // computeVertexNormals would keep the old size
    geometry.setAttribute('position', new BufferAttribute(data, 3))
  }
  geometry.computeBoundingSphere()
}
