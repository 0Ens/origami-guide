import { expect, it } from 'vitest'
import { foldSequence } from '../fold-engine'
import { sampleModel } from './sampleModel'

it('the playground sample folds without errors', () => {
  expect(foldSequence(sampleModel).states).toHaveLength(sampleModel.length + 1)
})
