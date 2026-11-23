/**
 * Core types of the fold engine.
 *
 * Coordinates: the unfolded sheet is the unit square [0,1]×[0,1] with the
 * origin bottom-left and y pointing up. The front (coloured) side faces the
 * viewer, i.e. +z. Between steps the model is always flat, so its state is
 * purely 2D plus a stacking order; 3D only appears while a step animates.
 */

export type Vec2 = readonly [number, number]
export type Vec3 = readonly [number, number, number]

/**
 * A planar piece of paper bounded by creases and/or the sheet's edges.
 * Faces are convex: they start as the square and are only ever cut by lines.
 */
export interface Face {
  /** Stable id, derived from the parent's id when a face is split. */
  readonly id: string
  /** Outline in original sheet coordinates, counter-clockwise. */
  readonly uv: readonly Vec2[]
  /** Outline in the current flat model, same vertex order as `uv`. */
  readonly xy: readonly Vec2[]
  /** Stacking order: higher layers lie closer to the viewer. */
  readonly layer: number
}

export interface PaperState {
  readonly faces: readonly Face[]
}

export type FoldDirection = 'valley' | 'mountain'

/** Which layers a fold takes along. */
export type LayerSelection =
  /** Every layer on the moving side of the line. */
  | 'all'
  /** The topmost layer under `moving`, plus all paper attached to it on that side. */
  | 'top'

/** Fold along a line. */
export interface LineFoldSpec {
  /** `fold` stays folded; `crease` folds and unfolds again, leaving a crease. */
  readonly kind: 'fold' | 'crease'
  /** Two distinct points on the fold line, in current model coordinates. */
  readonly line: readonly [Vec2, Vec2]
  /** Valley: the moving part comes towards the viewer. Mountain: it goes behind. */
  readonly direction: FoldDirection
  /** Any point on the side of the line that moves. */
  readonly moving: Vec2
  /** Defaults to `all`. */
  readonly layers?: LayerSelection
}

/** Turn the model over, left edge to right. */
export interface FlipSpec {
  readonly kind: 'flip'
}

/** Rotate the model in the table plane around its centre. */
export interface RotateSpec {
  readonly kind: 'rotate'
  /** Degrees, counter-clockwise. */
  readonly angle: number
}

export type FoldSpec = LineFoldSpec | FlipSpec | RotateSpec
