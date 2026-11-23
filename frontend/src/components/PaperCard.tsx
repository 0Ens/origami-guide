import { useTranslation } from 'react-i18next'
import type { Paper } from '../api/types'
import { PaperSwatch } from './PaperSwatch'
import './PaperCard.css'

/** The recommended sheet: size, kind of paper and an optional tip. */
export function PaperCard({ paper }: { paper: Paper }) {
  const { t } = useTranslation()

  return (
    <aside className="paper-card" aria-label={t('paper.title')}>
      <PaperSwatch paper={paper} size={48} />
      <div>
        <h2 className="paper-card__title">{t('paper.title')}</h2>
        <p className="paper-card__size">{t('paper.size', { size: paper.sizeCm })}</p>
        <p className="paper-card__type">{t(`paper.type.${paper.type}`)}</p>
        {paper.note && <p className="paper-card__note">{paper.note}</p>}
      </div>
    </aside>
  )
}
