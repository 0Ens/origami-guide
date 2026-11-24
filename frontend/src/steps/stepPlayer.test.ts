import { describe, expect, it } from 'vitest'
import { initialPlayer, stepPlayer, type StepAction, type StepPlayer } from './stepPlayer'

const last = 3
const run = (state: StepPlayer, ...actions: StepAction[]) => actions.reduce(stepPlayer, state)

describe('stepPlayer', () => {
  it('moves forward and back within the model', () => {
    expect(run(initialPlayer, { type: 'next', last }, { type: 'next', last }).step).toBe(2)
    expect(run(initialPlayer, { type: 'prev', last }).step).toBe(0)
    expect(run({ step: 3, playing: false }, { type: 'next', last }).step).toBe(3)
  })

  it('clamps and rounds a jump', () => {
    expect(stepPlayer(initialPlayer, { type: 'goTo', step: 9, last }).step).toBe(3)
    expect(stepPlayer(initialPlayer, { type: 'goTo', step: 1.6, last }).step).toBe(2)
    expect(stepPlayer(initialPlayer, { type: 'goTo', step: -2, last }).step).toBe(0)
  })

  it('plays to the end and stops there', () => {
    let state = stepPlayer(initialPlayer, { type: 'togglePlay', last })
    expect(state).toEqual({ step: 1, playing: true })
    state = stepPlayer(state, { type: 'tick', last })
    expect(state).toEqual({ step: 2, playing: true })
    expect(stepPlayer(state, { type: 'tick', last })).toEqual({ step: 3, playing: false })
  })

  it('plays the last fold without staying in play mode', () => {
    expect(stepPlayer({ step: 2, playing: false }, { type: 'togglePlay', last })).toEqual({ step: 3, playing: false })
  })

  it('stops playing when the learner steps by hand', () => {
    const playing = { step: 1, playing: true }
    expect(stepPlayer(playing, { type: 'next', last })).toEqual({ step: 2, playing: false })
    expect(stepPlayer(playing, { type: 'togglePlay', last })).toEqual({ step: 1, playing: false })
  })

  it('ignores a late timer tick after pausing', () => {
    const paused = { step: 1, playing: false }
    expect(stepPlayer(paused, { type: 'tick', last })).toBe(paused)
  })

  it('starts a finished model over when played again', () => {
    expect(stepPlayer({ step: 3, playing: false }, { type: 'togglePlay', last })).toEqual({ step: 0, playing: true })
  })

  it('does not play a model without steps', () => {
    expect(stepPlayer(initialPlayer, { type: 'togglePlay', last: 0 }).playing).toBe(false)
  })
})
