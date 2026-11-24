/** Seconds one step takes to play at normal speed. */
export const STEP_SECONDS = 1.2

/** Longest frame we honour; after a stalled tab the paper should not jump. */
const MAX_FRAME_SECONDS = 0.1

/**
 * Moves `from` toward `to` for a frame that took `delta` seconds. One step
 * plays in STEP_SECONDS, but a jump over several steps speeds up in
 * proportion, so going from step 1 to step 9 doesn't take ten seconds.
 */
export function approach(from: number, to: number, delta: number): number {
  const distance = Math.abs(to - from)
  const speed = (1 + Math.max(0, distance - 1) * 1.5) / STEP_SECONDS
  const move = speed * Math.min(delta, MAX_FRAME_SECONDS)
  return distance <= move ? to : from + Math.sign(to - from) * move
}
