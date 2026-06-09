import { describe, it, expect, vi } from 'vitest'

// Electron's runtime is not available under Vitest (Node), so mock it.
vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn() }
}))

import { registerSessionHandlers } from '../../src/main/ipc/handlers/sessions'
import { ipcMain } from 'electron'

describe('IPC Contract Tests', () => {
  it('exposes a session handler registrar', () => {
    // Smoke test: the registrar is callable and the (mocked) ipcMain bridge is present.
    expect(typeof registerSessionHandlers).toBe('function')
    expect(ipcMain).toBeDefined()
    expect(typeof ipcMain.handle).toBe('function')
  })
})
