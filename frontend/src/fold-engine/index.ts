// Public API of the fold engine. Everything else in this folder is internal.
export { applyStep, FoldError, planStep, type Motion, type StepPlan } from './fold'
export { parseFoldSpec } from './parse'
export { LAYER_GAP, poseFlat, poseStep, type FacePose } from './pose'
export { foldGuide, type FoldGuide } from './guide'
export { easeInOut, foldSequence, poseAt, type FoldSequence } from './sequence'
export { createSheet } from './split'
export type * from './types'
