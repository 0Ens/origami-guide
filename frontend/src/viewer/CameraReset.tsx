import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

interface Resettable {
  reset: () => void
}

/**
 * Puts the camera back where it started each time `signal` changes.
 * OrbitControls remembers its starting view, so reset() is all it takes.
 * A counter instead of a callback keeps the viewer's props plain data.
 */
export function CameraReset({ signal }: { signal: number }) {
  const controls = useThree((state) => state.controls) as Resettable | null
  const invalidate = useThree((state) => state.invalidate)
  const seen = useRef(signal)

  useEffect(() => {
    if (signal === seen.current || !controls) return
    seen.current = signal
    controls.reset()
    invalidate()
  }, [signal, controls, invalidate])

  return null
}
