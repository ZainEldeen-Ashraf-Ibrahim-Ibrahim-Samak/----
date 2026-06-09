import { z } from 'zod'

export type IpcResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

export function handleIpc<S extends z.ZodTypeAny, Output>(
  schema: S,
  handler: (input: z.output<S>) => Promise<Output> | Output
): (event: Electron.IpcMainInvokeEvent, data: unknown) => Promise<IpcResult<Output>> {
  return async (_event, data) => {
    try {
      const parsedInput = schema.parse(data)
      const result = await handler(parsedInput)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Validation failed: ' + error.message }
      }
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}
