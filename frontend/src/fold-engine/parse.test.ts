import { describe, expect, it } from 'vitest'
import { parseFoldSpec } from './parse'

describe('parseFoldSpec', () => {
  it('accepts a line fold, keeping only known properties', () => {
    const json = JSON.parse(
      '{"kind":"fold","line":[[0,0],[1,1]],"direction":"valley","moving":[1,0],"layers":"top","note":"x"}',
    )
    expect(parseFoldSpec(json)).toEqual({
      kind: 'fold',
      line: [[0, 0], [1, 1]],
      direction: 'valley',
      moving: [1, 0],
      layers: 'top',
    })
  })

  it('leaves out layers when not given', () => {
    expect(parseFoldSpec({ kind: 'crease', line: [[0, 0], [1, 1]], direction: 'mountain', moving: [1, 0] })).not.toHaveProperty(
      'layers',
    )
  })

  it('accepts flips and rotations', () => {
    expect(parseFoldSpec({ kind: 'flip' })).toEqual({ kind: 'flip' })
    expect(parseFoldSpec({ kind: 'rotate', angle: -45 })).toEqual({ kind: 'rotate', angle: -45 })
  })

  it.each([
    [null, /must be an object/],
    [{ kind: 'squash' }, /Unknown fold kind "squash"/],
    [{ kind: 'fold', line: [[0, 0]], direction: 'valley', moving: [1, 0] }, /line must be a pair/],
    [{ kind: 'fold', line: [[0, 0], [1, '1']], direction: 'valley', moving: [1, 0] }, /fold\.line\[1\]\[1\] must be a finite number/],
    [{ kind: 'fold', line: [[0, 0], [1, 1]], direction: 'sideways', moving: [1, 0] }, /direction must be/],
    [{ kind: 'fold', line: [[0, 0], [1, 1]], direction: 'valley' }, /fold\.moving must be an \[x, y\] pair/],
    [{ kind: 'rotate', angle: Number.NaN }, /angle must be a finite number/],
  ])('rejects %j', (input, message) => {
    expect(() => parseFoldSpec(input)).toThrow(message)
  })
})
