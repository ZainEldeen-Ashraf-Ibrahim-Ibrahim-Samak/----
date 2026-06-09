import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIpcQuery, useIpcMutation } from '../../hooks/useIpc'
import { BrandingConfig } from '@shared/schemas/branding'

export const Branding = () => {
  const { t } = useTranslation()
  const { data, fetch: fetchBranding } = useIpcQuery<BrandingConfig>('branding:get')
  const { mutate: updateBranding } = useIpcMutation('branding:set')

  const [form, setForm] = useState<BrandingConfig | null>(null)

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form) {
      await updateBranding(form)
      alert('Saved!')
    }
  }

  if (!form) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-accent">{t('app.settings')} - Branding</h1>
      <form
        onSubmit={handleSave}
        className="bg-surface p-6 rounded-lg border border-border space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name (English)</label>
          <input
            type="text"
            className="w-full border border-border rounded p-2 bg-background"
            value={form.name.en}
            onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
          <input
            type="text"
            className="w-full border border-border rounded p-2 bg-background text-right"
            value={form.name.ar}
            onChange={(e) => setForm({ ...form, name: { ...form.name, ar: e.target.value } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Accent Color</label>
          <input
            type="color"
            className="w-full h-10 border border-border rounded bg-background"
            value={form.accentColor}
            onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent text-white py-3 rounded-md font-bold mt-6 hover:bg-opacity-90"
        >
          Save Branding
        </button>
      </form>
    </div>
  )
}
