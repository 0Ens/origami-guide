import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Layout.css'

export function Layout() {
  const { t } = useTranslation()

  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__brand">
          <img src="/favicon.svg" alt="" width={24} height={24} />
          <span>{t('app.name')}</span>
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
