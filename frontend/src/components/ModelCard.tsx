import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { ModelSummary } from '../api/types'
import { PaperSwatch } from './PaperSwatch'

export function ModelCard({ model }: { model: ModelSummary }) {
  const { t } = useTranslation()

  return (
    <Link to={`/models/${model.slug}`} className="model-card">
      <div className="model-card__swatch">
        <PaperSwatch paper={model.paper} size={56} />
      </div>
      <div className="model-card__body">
        <h2>{model.title}</h2>
        <p>{model.summary}</p>
        <div className="model-card__meta">
          <span className={`badge badge--${model.difficulty.toLowerCase()}`}>
            {t(`difficulty.${model.difficulty}`)}
          </span>
          <span>{t('model.steps', { count: model.stepCount })}</span>
          <span>{t('paper.size', { size: model.paper.sizeCm })}</span>
        </div>
      </div>
    </Link>
  )
}
