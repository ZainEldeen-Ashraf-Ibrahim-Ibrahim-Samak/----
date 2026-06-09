import { ipcMain } from 'electron'
import { z } from 'zod'
import { handleIpc } from '../handler'
import { CenterRepository } from '../../db/repositories/center-repository'
import { centerSchema } from '../../../shared/schemas/center'
import { getConnection } from '../../db/connection'

export function registerCenterHandlers() {
  const db = getConnection()
  const repo = new CenterRepository(db)

  ipcMain.handle(
    'center:list',
    handleIpc(z.any(), async () => {
      return repo.listActive()
    })
  )

  ipcMain.handle(
    'center:get',
    handleIpc(z.object({ id: z.string() }), async ({ id }) => {
      return repo.getById(id)
    })
  )

  ipcMain.handle(
    'center:create',
    handleIpc(centerSchema, async (data) => {
      repo.create(data)
      return data
    })
  )

  ipcMain.handle(
    'center:update',
    handleIpc(centerSchema, async (data) => {
      repo.update(data)
      return data
    })
  )
}
