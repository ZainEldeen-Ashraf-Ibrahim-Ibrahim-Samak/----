import { autoUpdater } from 'electron-updater'
import { app } from 'electron'

export function setupUpdater(): void {
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }
}
