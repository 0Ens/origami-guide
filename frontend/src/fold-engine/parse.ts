import { FoldError } from './fold'
import type { FoldSpec, Vec2 } from './types'

/**
 * Turns untrusted JSON (e.g. from the API) into a FoldSpec, or explains
 * what is wrong with it. Unknown properties are ignored.
 */
export function parseFoldSpec(input: unknown): FoldSpec {
  const value = object(input, 'fold')
  switch (value.kind) {
    case 'fold':
    case 'crease': {
      const direction = value.direction
      if (direction !== 'valley' && direction !== 'mountain') {
        throw new FoldError(`fold.direction must be "valley" or "mountain", got ${JSON.stringify(direction)}`)
      }
      const layers = value.layers
      if (layers !== undefined && layers !== 'all' && layers !== 'top') {
        throw new FoldError(`fold.layers must be "all" or "top", got ${JSON.stringify(layers)}`)
      }
      if (!Array.isArray(value.line) || value.line.length !== 2) {
        throw new FoldError('fold.line must be a pair of points')
      }
      return {
        kind: value.kind,
        line: [point(value.line[0], 'fold.line[0]'), point(value.line[1], 'fold.line[1]')],
        direction,
        moving: point(value.moving, 'fold.moving'),
        ...(layers && { layers }),
      }
    }
    case 'flip':
      return { kind: 'flip' }
    case 'rotate':
      return { kind: 'rotate', angle: number(value.angle, 'fold.angle') }
    default:
      throw new FoldError(`Unknown fold kind ${JSON.stringify(value.kind)}`)
  }
}

function object(input: unknown, path: string): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new FoldError(`${path} must be an object`)
  }
  return input as Record<string, unknown>
}

function number(input: unknown, path: string): number {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new FoldError(`${path} must be a finite number`)
  }
  return input
}

function point(input: unknown, path: string): Vec2 {
  if (!Array.isArray(input) || input.length !== 2) {
    throw new FoldError(`${path} must be an [x, y] pair`)
  }
  return [number(input[0], `${path}[0]`), number(input[1], `${path}[1]`)]
}
