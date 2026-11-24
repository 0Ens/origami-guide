import type { FacePose, Vec2 } from '../fold-engine'

/** Flat arrays ready to upload to the GPU, plus what the camera needs to frame them. */
export interface PaperBuffers {
  /** Triangles as xyz triples, three vertices each. */
  readonly triangles: Float32Array
  /** Face outlines as xyz line segments, two vertices each. */
  readonly edges: Float32Array
  /** Middle of the paper seen from above, so the model stays centred as it changes shape. */
  readonly center: Vec2
  /** Lowest and highest point, so guides can float just above or below the paper. */
  readonly zRange: readonly [number, number]
}

/**
 * Turns posed faces into buffers. Faces are convex, so each is a triangle fan.
 * Vertices keep the face's own order, which is counter-clockwise on the
 * sheet's front: a triangle's normal therefore points out of the front side
 * of the paper, wherever the face has been folded to. The viewer relies on
 * this to paint the front and back colours.
 */
export function paperBuffers(poses: readonly FacePose[]): PaperBuffers {
  const triangleCount = poses.reduce((sum, face) => sum + face.vertices.length - 2, 0)
  const edgeCount = poses.reduce((sum, face) => sum + face.vertices.length, 0)
  const triangles = new Float32Array(triangleCount * 9)
  const edges = new Float32Array(edgeCount * 6)

  let [t, e] = [0, 0]
  let [minX, minY, minZ] = [Infinity, Infinity, Infinity]
  let [maxX, maxY, maxZ] = [-Infinity, -Infinity, -Infinity]

  for (const { vertices } of poses) {
    for (let i = 1; i < vertices.length - 1; i++) {
      for (const v of [vertices[0], vertices[i], vertices[i + 1]]) {
        triangles.set(v, t)
        t += 3
      }
    }
    vertices.forEach((v, i) => {
      edges.set(v, e)
      edges.set(vertices[(i + 1) % vertices.length], e + 3)
      e += 6
      minX = Math.min(minX, v[0])
      minY = Math.min(minY, v[1])
      minZ = Math.min(minZ, v[2])
      maxX = Math.max(maxX, v[0])
      maxY = Math.max(maxY, v[1])
      maxZ = Math.max(maxZ, v[2])
    })
  }

  return {
    triangles,
    edges,
    center: [(minX + maxX) / 2, (minY + maxY) / 2],
    zRange: [minZ, maxZ],
  }
}
