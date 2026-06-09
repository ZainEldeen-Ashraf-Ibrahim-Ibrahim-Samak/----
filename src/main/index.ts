import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { registerCenterHandlers } from './ipc/handlers/centers'
import { registerTeacherHandlers } from './ipc/handlers/teachers'
import { registerSessionHandlers } from './ipc/handlers/sessions'
import { registerBrandingHandlers } from './ipc/handlers/branding'
import { runMigrations } from './db/migrations/runner'
import { getConnection } from './db/connection'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173')
  }
}

app.whenReady().then(() => {
  // Init DB and run migrations
  const db = getConnection()
  runMigrations(db)

  // Register IPC handlers
  registerBrandingHandlers()
  registerCenterHandlers()
  registerTeacherHandlers()
  registerSessionHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
