import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'

function App() {
  const { t } = useTranslation()

  return (
    <main>
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>
      <LanguageSwitcher />
    </main>
  )
}

export default App
