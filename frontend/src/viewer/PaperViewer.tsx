import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { FoldSequence } from '../fold-engine'
import { Paper } from './Paper'
import './PaperViewer.css'

export interface PaperViewerProps {
  sequence: FoldSequence
  /** Step to show: 0 is the blank sheet, n the model after step n. Changes animate. */
  step: number
  frontColor: string
  backColor: string
  /** Describes the scene for screen readers. */
  label: string
}

/**
 * The 3D view of a model. Rendering is on demand: nothing is drawn while
 * the paper and the camera are still, which saves battery on phones.
 */
export default function PaperViewer({ sequence, step, frontColor, backColor, label }: PaperViewerProps) {
  return (
    <div className="paper-viewer" role="img" aria-label={label}>
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [0.45, 1.4, 1.05], fov: 40, near: 0.01, far: 20 }}>
        <hemisphereLight args={['#ffffff', '#b8b0a4', 1.2]} />
        <directionalLight position={[0.8, 2.5, 1.5]} intensity={1.6} />
        {/* A weaker light from below, so the underside reads when the model is turned over. */}
        <directionalLight position={[-1, -2, -0.5]} intensity={0.5} />
        <Paper sequence={sequence} target={step} frontColor={frontColor} backColor={backColor} />
        <OrbitControls makeDefault enablePan={false} minDistance={0.7} maxDistance={4} />
      </Canvas>
    </div>
  )
}
