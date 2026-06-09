import { ipcMain } from 'electron'
import { z } from 'zod'
import { handleIpc } from '../handler'
import { brandingService } from '../../branding'
import { brandingSchema } from '../../../shared/schemas/branding'

export function registerBrandingHandlers() {
  ipcMain.handle(
    'branding:get',
    handleIpc(z.any(), async () => {
      return brandingService.getBranding()
    })
  )

  ipcMain.handle(
    'branding:set',
    handleIpc(brandingSchema, async (data) => {
      brandingService.setBranding(data)
      // Optional: send branding:changed event to renderer
      // This requires access to webContents, which we can get via BrowserWindow.getAllWindows()
      return data
    })
  )
}
