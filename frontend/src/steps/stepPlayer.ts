/**
 * Where the learner is in a model, as pure state transitions.
 *
 * `step` counts the folds already made: 0 is the blank sheet and `last`
 * the finished model. Every action carries `last` because the number of
 * steps is only known once the model has loaded.
 */
export interface StepPlayer {
  step: number
  playing: boolean
}

export type StepAction =
  | { type: 'next'; last: number }
  | { type: 'prev'; last: number }
  | { type: 'goTo'; step: number; last: number }
  | { type: 'togglePlay'; last: number }
  /** Sent by the autoplay timer; unlike `next` it keeps playing. */
  | { type: 'tick'; last: number }

export const initialPlayer: StepPlayer = { step: 0, playing: false }

const clamp = (step: number, last: number) => Math.min(last, Math.max(0, step))

export function stepPlayer(state: StepPlayer, action: StepAction): StepPlayer {
  const { last } = action
  switch (action.type) {
    // Moving by hand stops autoplay: the learner has taken over.
    case 'next':
      return { step: clamp(state.step + 1, last), playing: false }
    case 'prev':
      return { step: clamp(state.step - 1, last), playing: false }
    case 'goTo':
      return { step: clamp(Math.round(action.step), last), playing: false }
    case 'togglePlay':
      if (state.playing) return { ...state, playing: false }
      // Playing a finished model rewinds it; then the timer takes over.
      if (state.step >= last) return { step: 0, playing: last > 0 }
      // Otherwise the next fold starts right away, like a video does.
      return { step: state.step + 1, playing: state.step + 1 < last }
    case 'tick': {
      if (!state.playing) return state
      const step = clamp(state.step + 1, last)
      return { step, playing: step < last }
    }
  }
}
