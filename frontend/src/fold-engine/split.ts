import { EPSILON, lerp2, signedArea, signedDistance, type Line } from './geometry'
import type { Face, Vec2 } from './types'

/** Result of cutting a face: the part left of the line (`positive`) and right of it. */
export interface SplitResult {
  readonly positive?: Face
  readonly negative?: Face
}

/**
 * Cuts a convex face along a line (Sutherland–Hodgman against both half
 * planes). New vertices get `uv` by interpolating along the cut edge,
 * which is exact because a face maps uv→xy by an isometry.
 *
 * A face that only touches the line is returned whole, on the side where
 * its body is.
 */
export function splitFace(face: Face, line: Line): SplitResult {
  const distances = face.xy.map((p) => signedDistance(line, p))
  const hasPositive = distances.some((d) => d > EPSILON)
  const hasNegative = distances.some((d) => d < -EPSILON)

  if (!hasNegative) return { positive: face }
  if (!hasPositive) return { negative: face }

  const positive: { uv: Vec2[]; xy: Vec2[] } = { uv: [], xy: [] }
  const negative: { uv: Vec2[]; xy: Vec2[] } = { uv: [], xy: [] }

  for (let i = 0; i < face.xy.length; i++) {
    const j = (i + 1) % face.xy.length
    const [di, dj] = [distances[i], distances[j]]

    // Vertices on the line belong to both halves.
    if (di >= -EPSILON) push(positive, face.uv[i], face.xy[i])
    if (di <= EPSILON) push(negative, face.uv[i], face.xy[i])

    // A strict sign change means the edge crosses the line: add the crossing point to both.
    if ((di > EPSILON && dj < -EPSILON) || (di < -EPSILON && dj > EPSILON)) {
      const t = di / (di - dj)
      const uv = lerp2(face.uv[i], face.uv[j], t)
      const xy = lerp2(face.xy[i], face.xy[j], t)
      push(positive, uv, xy)
      push(negative, uv, xy)
    }
  }

  return {
    positive: { ...face, id: `${face.id}.0`, ...positive },
    negative: { ...face, id: `${face.id}.1`, ...negative },
  }
}

function push(target: { uv: Vec2[]; xy: Vec2[] }, uv: Vec2, xy: Vec2) {
  target.uv.push(uv)
  target.xy.push(xy)
}

/** A whole, unfolded sheet: one face, front side up. */
export function createSheet(): { faces: Face[] } {
  const square: Vec2[] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  return { faces: [{ id: 'f', uv: square, xy: square, layer: 0 }] }
}

/** Area of a face in sheet units; useful for invariants in tests. */
export const faceArea = (face: Face): number => Math.abs(signedArea(face.uv))
