import { nativeImage, BrowserWindow } from 'electron'

export function updateAppIcon(base64Data: string) {
  try {
    const icon = nativeImage.createFromDataURL(base64Data)
    // Update all windows
    BrowserWindow.getAllWindows().forEach((win) => {
      win.setIcon(icon)
    })
    // Optionally update app dock icon on macOS
    if (process.platform === 'darwin' && typeof require('electron').app.dock !== 'undefined') {
      require('electron').app.dock.setIcon(icon)
    }
  } catch (error) {
    console.error('Failed to update app icon', error)
  }
}
