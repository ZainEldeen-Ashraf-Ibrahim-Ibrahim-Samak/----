import { useEffect, useState } from 'react'
import { createHashRouter, Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeProvider'
import { Centers } from '../pages/Centers'
import { Teachers } from '../pages/Teachers'
import { NewSession } from '../pages/NewSession'
import { SessionsLog } from '../pages/SessionsLog'
import { Branding as SettingsBranding } from '../pages/settings/Branding'
import { useIpcQuery } from '../hooks/useIpc'
import { BrandingConfig } from '@shared/schemas/branding'

const Layout = () => {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { data: branding } = useIpcQuery<BrandingConfig>('branding:get')
  const [accent, setAccent] = useState('#2563EB')
  const [appName, setAppName] = useState('EduCenter')

  useEffect(() => {
    if (branding) {
      setAccent(branding.accentColor)
      document.documentElement.style.setProperty('--color-accent', branding.accentColor)
      setAppName(i18n.language === 'ar' ? branding.name.ar : branding.name.en)
    }
  }, [branding, i18n.language])

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen bg-background text-text transition-colors duration-200">
      <aside className="w-64 bg-surface border-r rtl:border-l rtl:border-r-0 border-border p-4 flex flex-col transition-colors duration-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: accent }}></div>
          <h1 className="text-xl font-bold" style={{ color: accent }}>
            {appName}
          </h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link to="/" className="p-2 hover:bg-border rounded">
            {t('app.dashboard')}
          </Link>
          <Link to="/centers" className="p-2 hover:bg-border rounded">
            {t('app.centers')}
          </Link>
          <Link to="/teachers" className="p-2 hover:bg-border rounded">
            {t('app.teachers')}
          </Link>
          <Link
            to="/sessions/new"
            className="p-2 hover:bg-border rounded font-medium"
            style={{ color: accent }}
          >
            {t('app.log_session')}
          </Link>
          <Link to="/sessions" className="p-2 hover:bg-border rounded">
            {t('app.sessions_log')}
          </Link>
          <div className="mt-auto"></div>
          <Link to="/settings/branding" className="p-2 hover:bg-border rounded text-text-muted">
            {t('app.settings')}
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-end px-6 gap-4 transition-colors duration-200">
          <button onClick={toggleLanguage} className="p-2 hover:bg-border rounded font-medium">
            {i18n.language === 'ar' ? 'English' : 'عربي'}
          </button>
          <button onClick={toggleTheme} className="p-2 hover:bg-border rounded">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <div>Dashboard Content placeholder</div> },
      { path: 'centers', element: <Centers /> },
      { path: 'teachers', element: <Teachers /> },
      { path: 'sessions/new', element: <NewSession /> },
      { path: 'sessions', element: <SessionsLog /> },
      { path: 'settings/branding', element: <SettingsBranding /> }
    ]
  }
])
