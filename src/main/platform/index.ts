import { app, dialog, Notification } from 'electron'

export const platform = {
  getAppPath() {
    return app.getAppPath()
  },
  getUserDataPath() {
    return app.getPath('userData')
  },
  async showOpenDialog(options: Electron.OpenDialogOptions) {
    return dialog.showOpenDialog(options)
  },
  async showSaveDialog(options: Electron.SaveDialogOptions) {
    return dialog.showSaveDialog(options)
  },
  showNotification(title: string, body: string) {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  }
}
