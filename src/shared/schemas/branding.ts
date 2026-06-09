import { z } from 'zod'

export const brandingSchema = z.object({
  name: z.object({
    ar: z.string(),
    en: z.string()
  }),
  logoDataUrl: z.string().optional(), // base64 representation of logo
  accentColor: z.string() // Hex code
})

export type BrandingConfig = z.infer<typeof brandingSchema>

export const defaultBranding: BrandingConfig = {
  name: {
    ar: 'إديوسنتر',
    en: 'EduCenter'
  },
  accentColor: '#2563EB'
}
