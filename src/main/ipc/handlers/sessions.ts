import { ipcMain } from 'electron'
import { z } from 'zod'
import { handleIpc } from '../handler'
import { SessionRepository } from '../../db/repositories/session-repository'
import { TeacherRepository } from '../../db/repositories/teacher-repository'
import { sessionSchema } from '../../../shared/schemas/session'
import { getConnection } from '../../db/connection'
import { calculateSessionRevenue } from '../../services/revenue/calculator'

export function registerSessionHandlers() {
  const db = getConnection()
  const sessionRepo = new SessionRepository(db)
  const teacherRepo = new TeacherRepository(db)

  ipcMain.handle(
    'session:listByCenterAndDate',
    handleIpc(
      z.object({ centerId: z.string(), startDate: z.string(), endDate: z.string() }),
      async ({ centerId, startDate, endDate }) => {
        return sessionRepo.listByCenterAndDateRange(centerId, startDate, endDate)
      }
    )
  )

  ipcMain.handle(
    'session:create',
    handleIpc(sessionSchema, async (data) => {
      // Re-verify calculations based on the teacher's config
      const teacher = teacherRepo.getById(data.teacherId)
      if (!teacher) throw new Error('Teacher not found')

      const calcs = calculateSessionRevenue(teacher, {
        studentCount: data.studentCount,
        pricePerStudent: data.pricePerStudent
      })

      const newSession = {
        ...data,
        totalRevenue: calcs.totalRevenue,
        teacherEarning: calcs.teacherEarning,
        ownerNet: calcs.ownerNet
      }

      sessionRepo.create(newSession)
      return newSession
    })
  )
}
