import type { FoldSpec } from '../fold-engine'

/** A short made-up sequence that uses every kind of step, for trying the viewer out. */
export const sampleModel: readonly FoldSpec[] = [
  { kind: 'crease', line: [[0, 0.5], [1, 0.5]], direction: 'valley', moving: [0.5, 0.9] },
  { kind: 'fold', line: [[0, 0], [1, 1]], direction: 'valley', moving: [0.1, 0.9] },
  { kind: 'fold', line: [[0.7, 0], [1, 0.3]], direction: 'valley', moving: [0.95, 0.05] },
  { kind: 'flip' },
  { kind: 'fold', line: [[0.3, 0], [0.3, 1]], direction: 'mountain', moving: [0.1, 0.05] },
  { kind: 'rotate', angle: 45 },
]
