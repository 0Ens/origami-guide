import { useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { BackSide, BufferAttribute, BufferGeometry, FrontSide, type Group } from 'three'
import { poseAt, type FoldSequence } from '../fold-engine'
import { paperBuffers } from './paperBuffers'

interface PaperProps {
  sequence: FoldSequence
  /** Position along the sequence; fractions are steps in progress. */
  position: number
  frontColor: string
  backColor: string
  /** Drawn in sheet coordinates, moving with the paper (fold guides). */
  children?: ReactNode
}

/**
 * The sheet. One geometry is drawn twice: the front material only shows
 * triangles facing the camera and the back material only the others. As
 * triangles always face out of the sheet's front, a folded-over flap shows
 * its back colour without the paper having any thickness.
 */
export function Paper({ sequence, position, frontColor, backColor, children }: PaperProps) {
  const surface = useMemo(() => new BufferGeometry(), [])
  const outline = useMemo(() => new BufferGeometry(), [])
  const centred = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => () => [surface, outline].forEach((geometry) => geometry.dispose()), [surface, outline])

  useLayoutEffect(() => {
    const buffers = paperBuffers(poseAt(sequence, position))
    writePositions(surface, buffers.triangles)
    surface.computeVertexNormals()
    writePositions(outline, buffers.edges)
    centred.current?.position.set(-buffers.center[0], -buffers.center[1], 0)
    invalidate()
  }, [sequence, position, surface, outline, invalidate])

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
        {children}
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
