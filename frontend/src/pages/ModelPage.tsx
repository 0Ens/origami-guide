import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { api, ApiError } from '../api/client'
import type { ModelDetail } from '../api/types'
import { useApi } from '../api/useApi'
import { PaperCard } from '../components/PaperCard'
import { StatusMessage } from '../components/StatusMessage'
import { InstructionPanel } from '../steps/InstructionPanel'
import { modelSequence } from '../steps/modelSequence'
import { useShortcuts } from '../steps/shortcuts'
import { StepControls } from '../steps/StepControls'
import { useStepPlayer } from '../steps/useStepPlayer'
import './ModelPage.css'

// three.js is large; only pages that show a model download it.
const PaperViewer = lazy(() => import('../viewer/PaperViewer'))

/**
 * 404: no such model. 400: the API rejected the slug's format, so no such
 * model can exist either. Retrying won't help in both cases, unlike 5xx or
 * network errors.
 */
const isMissing = (error: unknown) => error instanceof ApiError && (error.status === 404 || error.status === 400)

export function ModelPage() {
  const { slug = '' } = useParams()
  // A new key per model: going to another model starts at its first step.
  return <ModelView key={slug} slug={slug} />
}

function ModelView({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'en'
  const model = useApi(`model:${slug}:${language}`, (signal) => api.getModel(slug, language, signal))
  const data = model.status === 'success' ? model.data : null

  // The player lives up here, outside the loaded content, so switching the
  // language (which reloads the model) keeps the learner on their step.
  const player = useStepPlayer(data?.steps.length ?? 0)
  const [cameraResets, setCameraResets] = useState(0)
  const folded = useMemo(() => (data ? modelSequence(data.steps) : null), [data])

  useEffect(() => {
    if (folded && !folded.ok) console.error(`Cannot fold model "${slug}": ${folded.reason}`)
  }, [folded, slug])

  useShortcuts((shortcut) => {
    if (shortcut === 'resetCamera') setCameraResets((n) => n + 1)
    else player.command(shortcut)
  }, folded?.ok === true)

  return (
    <section className="model-page">
      <Link to="/" className="model-page__back">
        ← {t('model.back')}
      </Link>

      {model.status === 'loading' && <StatusMessage>{t('home.loading')}</StatusMessage>}

      {model.status === 'error' &&
        (isMissing(model.error) ? (
          <StatusMessage>{t('model.notFound')}</StatusMessage>
        ) : (
          <StatusMessage action={{ label: t('home.retry'), onClick: model.reload }}>
            {t('model.error')}
          </StatusMessage>
        ))}

      {data && folded && (
        <>
          <header className="model-page__header">
            <div>
              <h1>{data.title}</h1>
              <p>{data.summary}</p>
            </div>
            <PaperCard paper={data.paper} />
          </header>

          {folded.ok ? (
            <div className="model-page__studio">
              <Suspense fallback={<div className="model-page__viewer-loading">{t('model.viewerLoading')}</div>}>
                <PaperViewer
                  sequence={folded.sequence}
                  step={player.step}
                  frontColor={data.paper.frontColor}
                  backColor={data.paper.backColor}
                  label={viewerLabel(t, data, player.step)}
                  cameraResets={cameraResets}
                />
              </Suspense>
              <div className="model-page__panel">
                <InstructionPanel steps={data.steps} step={player.step} />
                <StepControls
                  step={player.step}
                  last={data.steps.length}
                  playing={player.playing}
                  onCommand={player.command}
                  onGoTo={player.goTo}
                  onResetCamera={() => setCameraResets((n) => n + 1)}
                />
              </div>
            </div>
          ) : (
            <StatusMessage>{t('model.noViewer')}</StatusMessage>
          )}

          {/* Every step at a glance; the only guide when the 3D view can't be shown. */}
          <details className="model-page__all-steps" open={!folded.ok}>
            <summary>{t('model.allSteps')}</summary>
            <ol>
              {data.steps.map((step) => (
                <li key={step.number}>{step.instruction}</li>
              ))}
            </ol>
          </details>
        </>
      )}
    </section>
  )
}

function viewerLabel(t: TFunction, model: ModelDetail, step: number) {
  const total = model.steps.length
  return step < total
    ? t('model.viewerLabel', { title: model.title, current: step + 1, total })
    : t('model.viewerLabelFinished', { title: model.title })
}
