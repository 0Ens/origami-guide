import { useTranslation } from 'react-i18next'
import type { Step } from '../api/types'
import './InstructionPanel.css'

/**
 * The written instruction for the fold about to be made, matching the
 * guide drawn on the paper. A polite live region, so screen readers read
 * each new step without interrupting.
 */
export function InstructionPanel({ steps, step }: { steps: readonly Step[]; step: number }) {
  const { t } = useTranslation()
  const current = steps[step]

  return (
    <div className="instruction" aria-live="polite">
      {current ? (
        <>
          <p className="instruction__count">{t('steps.current', { current: step + 1, total: steps.length })}</p>
          <p className="instruction__text">{current.instruction}</p>
        </>
      ) : (
        <>
          <p className="instruction__count">{t('steps.finished')}</p>
          <p className="instruction__text">{t('steps.finishedText')}</p>
        </>
      )}
    </div>
  )
}
