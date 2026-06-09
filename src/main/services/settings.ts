import Store from 'electron-store'

export interface AppSettings {
  language: 'ar' | 'en'
  theme: 'light' | 'dark' | 'system'
  inCenterServiceTypes: string[]
  syncConfig: {
    enabled: boolean
    autoSync: boolean
  }
}

const defaultSettings: AppSettings = {
  language: 'ar',
  theme: 'system',
  inCenterServiceTypes: ['Equipment Rental', 'Production Support'],
  syncConfig: {
    enabled: false,
    autoSync: true
  }
}

export const settingsStore = new Store<AppSettings>({
  name: 'educenter-settings',
  defaults: defaultSettings
})

export const getSettings = (): AppSettings => {
  return settingsStore.store
}

export const updateSettings = (partial: Partial<AppSettings>): void => {
  settingsStore.set(partial)
}
