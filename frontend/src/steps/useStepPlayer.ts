import { useCallback, useEffect, useReducer } from 'react'
import { STEP_SECONDS } from '../viewer/animation'
import { initialPlayer, stepPlayer } from './stepPlayer'

/** Time to look at each finished fold before autoplay moves on. */
const PAUSE_MS = 900

export type StepCommand = 'next' | 'prev' | 'first' | 'last' | 'togglePlay'

/**
 * The reducer plus the autoplay timer. While playing, each step change
 * schedules the next tick after the fold's animation and a short pause.
 * Changing the step restarts the timer, so it never fires mid-fold.
 */
export function useStepPlayer(last: number) {
  const [state, dispatch] = useReducer(stepPlayer, initialPlayer)
  // `last` is 0 while the model loads; never point past the model we have.
  const step = Math.min(state.step, last)

  useEffect(() => {
    if (!state.playing) return
    const timer = window.setTimeout(() => dispatch({ type: 'tick', last }), STEP_SECONDS * 1000 + PAUSE_MS)
    return () => window.clearTimeout(timer)
  }, [state.playing, state.step, last])

  const command = useCallback(
    (name: StepCommand) => {
      if (name === 'first') dispatch({ type: 'goTo', step: 0, last })
      else if (name === 'last') dispatch({ type: 'goTo', step: last, last })
      else dispatch({ type: name, last })
    },
    [last],
  )
  const goTo = useCallback((target: number) => dispatch({ type: 'goTo', step: target, last }), [last])

  return { step, playing: state.playing, command, goTo }
}
