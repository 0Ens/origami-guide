import { describe, expect, it } from 'vitest'
import { applyStep, createSheet, poseFlat } from '../fold-engine'
import { paperBuffers } from './paperBuffers'

/** z of the normal of every triangle: positive means the front side faces up. */
function normalsZ(triangles: Float32Array): number[] {
  const result: number[] = []
  for (let i = 0; i < triangles.length; i += 9) {
    const [ax, ay, bx, by, cx, cy] = [triangles[i], triangles[i + 1], triangles[i + 3], triangles[i + 4], triangles[i + 6], triangles[i + 7]]
    result.push((bx - ax) * (cy - ay) - (by - ay) * (cx - ax))
  }
  return result
}

describe('paperBuffers', () => {
  it('turns the blank sheet into two triangles and four edges', () => {
    const buffers = paperBuffers(poseFlat(createSheet()))
    expect(buffers.triangles).toHaveLength(2 * 9)
    expect(buffers.edges).toHaveLength(4 * 6)
    expect(buffers.center).toEqual([0.5, 0.5])
    expect(buffers.zRange).toEqual([0, 0])
  })

  it('shows the front of an unfolded sheet from above', () => {
    const { triangles } = paperBuffers(poseFlat(createSheet()))
    expect(normalsZ(triangles).every((z) => z > 0)).toBe(true)
  })

  it('shows the back of the half that was folded over', () => {
    const folded = applyStep(createSheet(), {
      kind: 'fold',
      line: [[0.5, 0], [0.5, 1]],
      direction: 'valley',
      moving: [0.9, 0.5],
    })
    const buffers = paperBuffers(poseFlat(folded))
    const zs = normalsZ(buffers.triangles)
    expect(zs.filter((z) => z > 0)).toHaveLength(2)
    expect(zs.filter((z) => z < 0)).toHaveLength(2)
    expect(buffers.center[0]).toBeCloseTo(0.25)
    expect(buffers.zRange[1]).toBeGreaterThan(0)
  })
})
