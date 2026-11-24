import { describe, expect, it } from 'vitest'
import { approach, STEP_SECONDS } from './animation'

/** Runs frames of `delta` seconds until the target is reached; returns the time it took. */
function timeToReach(from: number, to: number, delta = 1 / 60): number {
  let [position, time] = [from, 0]
  while (position !== to) {
    position = approach(position, to, delta)
    time += delta
  }
  return time
}

describe('approach', () => {
  it('plays one step in about STEP_SECONDS, in both directions', () => {
    expect(timeToReach(2, 3)).toBeCloseTo(STEP_SECONDS, 1)
    expect(timeToReach(3, 2)).toBeCloseTo(STEP_SECONDS, 1)
  })

  it('lands exactly on the target instead of overshooting', () => {
    expect(approach(2.99, 3, 1 / 60)).toBe(3)
  })

  it('crosses many steps far faster than one by one', () => {
    expect(timeToReach(0, 8)).toBeLessThan(3 * STEP_SECONDS)
  })

  it('ignores the gap after a stalled frame', () => {
    expect(approach(0, 1, 5)).toBeLessThan(0.1)
  })
})
