import { useTranslation } from 'react-i18next'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, ResetIcon } from './icons'
import type { StepCommand } from './useStepPlayer'
import './StepControls.css'

interface StepControlsProps {
  /** Folds already made: 0 is the blank sheet, `last` the finished model. */
  step: number
  last: number
  playing: boolean
  onCommand: (command: StepCommand) => void
  onGoTo: (step: number) => void
  onResetCamera: () => void
}

/**
 * Buttons, a clickable progress bar and a reminder of the keyboard keys.
 * "Step n" always means the fold about to be made, the one the guide on
 * the paper shows, so segment n takes the paper to just before it.
 */
export function StepControls({ step, last, playing, onCommand, onGoTo, onResetCamera }: StepControlsProps) {
  const { t } = useTranslation()
  const segments = Array.from({ length: last }, (_, index) => index + 1)

  return (
    <div className="step-controls" role="group" aria-label={t('steps.controls')}>
      <div className="step-controls__buttons">
        <button
          type="button"
          className="step-controls__button"
          onClick={() => onCommand('prev')}
          disabled={step === 0}
          aria-label={t('steps.prev')}
          title={t('steps.prev')}
        >
          <PrevIcon />
        </button>
        <button
          type="button"
          className="step-controls__button step-controls__button--primary"
          onClick={() => onCommand('togglePlay')}
          aria-label={playing ? t('steps.pause') : t('steps.play')}
          title={playing ? t('steps.pause') : t('steps.play')}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="step-controls__button"
          onClick={() => onCommand('next')}
          disabled={step === last}
          aria-label={t('steps.next')}
          title={t('steps.next')}
        >
          <NextIcon />
        </button>
        <button
          type="button"
          className="step-controls__button step-controls__button--quiet"
          onClick={onResetCamera}
          aria-label={t('steps.resetCamera')}
          title={t('steps.resetCamera')}
        >
          <ResetIcon />
        </button>
      </div>

      <ol className="step-progress">
        {segments.map((n) => {
          const state = n <= step ? 'done' : n === step + 1 ? 'current' : 'todo'
          return (
            <li key={n}>
              <button
                type="button"
                className={`step-progress__segment step-progress__segment--${state}`}
                onClick={() => onGoTo(n - 1)}
                aria-label={t('steps.goTo', { step: n })}
                aria-current={state === 'current' ? 'step' : undefined}
              />
            </li>
          )
        })}
      </ol>

      <p className="step-controls__keys">
        <span>
          <kbd>←</kbd> <kbd>→</kbd> {t('steps.keys.step')}
        </span>
        <span>
          <kbd>Space</kbd> {t('steps.keys.play')}
        </span>
        <span>
          <kbd>R</kbd> {t('steps.keys.resetCamera')}
        </span>
      </p>
    </div>
  )
}
