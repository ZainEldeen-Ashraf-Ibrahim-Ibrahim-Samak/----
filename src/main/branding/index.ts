import { app } from 'electron'
import * as fs from 'fs'
import { join } from 'path'
import { BrandingConfig, defaultBranding, brandingSchema } from '../../shared/schemas/branding'

export const brandingService = {
  getBrandingPath(): string {
    return join(app.getPath('userData'), 'branding.json')
  },

  getBranding(): BrandingConfig {
    try {
      const p = this.getBrandingPath()
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'))
        return brandingSchema.parse(data)
      }
    } catch (err) {
      console.error('Error reading branding.json, falling back to defaults', err)
    }
    return defaultBranding
  },

  setBranding(config: BrandingConfig): void {
    const valid = brandingSchema.parse(config)
    fs.writeFileSync(this.getBrandingPath(), JSON.stringify(valid, null, 2))
  }
}
