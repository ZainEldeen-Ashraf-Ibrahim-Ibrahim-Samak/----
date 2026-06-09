import { join } from 'path'
import * as fs from 'fs'
import { app } from 'electron'

const logDir = app.isPackaged ? app.getPath('logs') : join(__dirname, '../../logs')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logFile = join(logDir, 'app.log')

export const logger = {
  info: (message: string, meta?: any) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message} ${meta ? JSON.stringify(meta) : ''}\n`
    fs.appendFileSync(logFile, log)
    console.log(log.trim())
  },
  error: (message: string, error?: any) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message} ${error ? String(error) : ''}\n`
    fs.appendFileSync(logFile, log)
    console.error(log.trim())
  }
}
