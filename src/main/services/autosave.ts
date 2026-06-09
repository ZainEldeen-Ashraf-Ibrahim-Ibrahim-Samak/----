import Store from 'electron-store'

interface DraftData {
  [key: string]: any
}

const draftStore = new Store<{ drafts: Record<string, DraftData> }>({
  name: 'educenter-drafts',
  defaults: {
    drafts: {}
  }
})

export const autosaveService = {
  saveDraft(formId: string, data: DraftData): void {
    const drafts = draftStore.get('drafts')
    drafts[formId] = data
    draftStore.set('drafts', drafts)
  },

  getDraft(formId: string): DraftData | null {
    const drafts = draftStore.get('drafts')
    return drafts[formId] || null
  },

  clearDraft(formId: string): void {
    const drafts = draftStore.get('drafts')
    delete drafts[formId]
    draftStore.set('drafts', drafts)
  }
}
