import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'
import './LanguageSwitcher.css'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          aria-pressed={i18n.resolvedLanguage === lng}
          onClick={() => void i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
