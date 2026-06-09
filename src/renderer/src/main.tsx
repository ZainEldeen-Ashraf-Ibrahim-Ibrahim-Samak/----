import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ThemeProvider } from './theme/ThemeProvider'
import { DirectionProvider } from './app/DirectionProvider'
import './i18n'
import '../theme/tokens.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <DirectionProvider>
        <RouterProvider router={router} />
      </DirectionProvider>
    </ThemeProvider>
  </React.StrictMode>
)
