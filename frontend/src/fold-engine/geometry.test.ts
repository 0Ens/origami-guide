import { describe, expect, it } from 'vitest'
import {
  boundingBox,
  containsPoint,
  lineThrough,
  reflect,
  rotate2,
  rotateAroundLine,
  sideOf,
  signedArea,
  signedDistance,
} from './geometry'
import type { Vec2 } from './types'

const square: Vec2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]

const expectVec = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((value, i) => expect(actual[i]).toBeCloseTo(value, 9))

describe('signedArea', () => {
  it('is positive for counter-clockwise and negative for clockwise polygons', () => {
    expect(signedArea(square)).toBe(1)
    expect(signedArea([...square].reverse())).toBe(-1)
  })
})

describe('containsPoint', () => {
  it('accepts inner and boundary points, in either winding', () => {
    expect(containsPoint(square, [0.5, 0.5])).toBe(true)
    expect(containsPoint(square, [1, 0.3])).toBe(true)
    expect(containsPoint([...square].reverse(), [0.2, 0.9])).toBe(true)
  })

  it('rejects outside points', () => {
    expect(containsPoint(square, [1.01, 0.5])).toBe(false)
    expect(containsPoint(square, [-0.5, -0.5])).toBe(false)
  })
})

describe('lineThrough', () => {
  it('rejects a degenerate line', () => {
    expect(() => lineThrough([0.3, 0.3], [0.3, 0.3])).toThrow(/two distinct points/)
  })

  it('puts positive distances on the left', () => {
    const upwards = lineThrough([0.5, 0], [0.5, 1])
    expect(signedDistance(upwards, [0, 0.5])).toBeCloseTo(0.5)
    expect(sideOf(upwards, [0, 0.5])).toBe(1)
    expect(sideOf(upwards, [1, 0.5])).toBe(-1)
    expect(sideOf(upwards, [0.5, 0.7])).toBe(0)
  })
})

describe('reflect', () => {
  it('mirrors across the diagonal', () => {
    const diagonal = lineThrough([0, 0], [1, 1])
    expectVec(reflect(diagonal, [1, 0]), [0, 1])
    expectVec(reflect(diagonal, [0.25, 0.25]), [0.25, 0.25])
  })
})

describe('rotate2', () => {
  it('rotates counter-clockwise around a centre', () => {
    expectVec(rotate2([1, 0.5], [0.5, 0.5], Math.PI / 2), [0.5, 1])
  })
})

describe('rotateAroundLine', () => {
  const axis = lineThrough([0.5, 0], [0.5, 1])

  it('lifts the left side towards the viewer for positive angles', () => {
    expectVec(rotateAroundLine([0, 0.3, 0], axis, Math.PI / 2), [0.5, 0.3, 0.5])
  })

  it('lands on the reflection after half a turn', () => {
    expectVec(rotateAroundLine([0.1, 0.3, 0], axis, Math.PI), [0.9, 0.3, 0])
  })

  it('leaves points on the axis in place', () => {
    expectVec(rotateAroundLine([0.5, 0.8, 0], axis, 1.234), [0.5, 0.8, 0])
  })
})

describe('boundingBox', () => {
  it('spans all points', () => {
    expect(boundingBox([[0.2, 0.9], [0.6, 0.1], [0.4, 0.5]])).toEqual({ min: [0.2, 0.1], max: [0.6, 0.9] })
  })
})
