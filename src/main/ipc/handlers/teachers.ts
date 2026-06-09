import { ipcMain } from 'electron'
import { z } from 'zod'
import { handleIpc } from '../handler'
import { TeacherRepository } from '../../db/repositories/teacher-repository'
import { teacherSchema } from '../../../shared/schemas/teacher'
import { getConnection } from '../../db/connection'

export function registerTeacherHandlers() {
  const db = getConnection()
  const repo = new TeacherRepository(db)

  ipcMain.handle(
    'teacher:listByCenter',
    handleIpc(z.object({ centerId: z.string() }), async ({ centerId }) => {
      return repo.listByCenter(centerId)
    })
  )

  ipcMain.handle(
    'teacher:get',
    handleIpc(z.object({ id: z.string() }), async ({ id }) => {
      return repo.getById(id)
    })
  )

  ipcMain.handle(
    'teacher:create',
    handleIpc(teacherSchema, async (data) => {
      repo.create(data)
      return data
    })
  )

  ipcMain.handle(
    'teacher:update',
    handleIpc(teacherSchema, async (data) => {
      repo.update(data)
      return data
    })
  )
}
