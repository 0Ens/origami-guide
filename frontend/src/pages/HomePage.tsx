import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { useApi } from '../api/useApi'
import { ModelCard } from '../components/ModelCard'
import { StatusMessage } from '../components/StatusMessage'
import './HomePage.css'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'en'
  const models = useApi(`models:${language}`, (signal) => api.listModels(language, signal))

  return (
    <section className="home">
      <header className="home__intro">
        <h1>{t('home.title')}</h1>
        <p>{t('home.intro')}</p>
      </header>

      {models.status === 'loading' && <StatusMessage>{t('home.loading')}</StatusMessage>}

      {models.status === 'error' && (
        <StatusMessage action={{ label: t('home.retry'), onClick: models.reload }}>
          {t('home.error')}
        </StatusMessage>
      )}

      {models.status === 'success' &&
        (models.data.length === 0 ? (
          <StatusMessage>{t('home.empty')}</StatusMessage>
        ) : (
          <div className="home__grid">
            {models.data.map((model) => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        ))}
    </section>
  )
}
