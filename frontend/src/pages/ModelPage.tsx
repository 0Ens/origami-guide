import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { api, ApiError } from '../api/client'
import { useApi } from '../api/useApi'
import { PaperCard } from '../components/PaperCard'
import { StatusMessage } from '../components/StatusMessage'
import './ModelPage.css'

export function ModelPage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'en'
  const model = useApi(`model:${slug}:${language}`, (signal) => api.getModel(slug, language, signal))

  return (
    <section className="model-page">
      <Link to="/" className="model-page__back">
        ← {t('model.back')}
      </Link>

      {model.status === 'loading' && <StatusMessage>{t('home.loading')}</StatusMessage>}

      {model.status === 'error' &&
        (model.error instanceof ApiError && model.error.status === 404 ? (
          <StatusMessage>{t('model.notFound')}</StatusMessage>
        ) : (
          <StatusMessage action={{ label: t('home.retry'), onClick: model.reload }}>
            {t('home.error')}
          </StatusMessage>
        ))}

      {model.status === 'success' && (
        <>
          <header className="model-page__header">
            <div>
              <h1>{model.data.title}</h1>
              <p>{model.data.summary}</p>
            </div>
            <PaperCard paper={model.data.paper} />
          </header>

          <ol className="model-page__steps">
            {model.data.steps.map((step) => (
              <li key={step.number}>{step.instruction}</li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
