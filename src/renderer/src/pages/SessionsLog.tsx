import { useEffect } from 'react'
import { useIpcQuery } from '../hooks/useIpc'
import { Session } from '@shared/schemas/session'
import { format } from 'date-fns'

export const SessionsLog = () => {
  const { data: sessions, fetch: fetchSessions } = useIpcQuery<Session[]>(
    'session:listByCenterAndDate'
  )
  const defaultCenterId = 'c1'

  useEffect(() => {
    // Stub fetching current month
    fetchSessions({
      centerId: defaultCenterId,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
    })
  }, [fetchSessions])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent">Sessions Log</h1>
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="p-4 font-medium text-sm text-text-muted">Date</th>
              <th className="p-4 font-medium text-sm text-text-muted">Subject</th>
              <th className="p-4 font-medium text-sm text-text-muted text-right">Students</th>
              <th className="p-4 font-medium text-sm text-text-muted text-right">Revenue</th>
              <th className="p-4 font-medium text-sm text-text-muted text-right">
                Teacher Earning
              </th>
              <th className="p-4 font-medium text-sm text-text-muted text-right">Owner Net</th>
            </tr>
          </thead>
          <tbody>
            {sessions?.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-gray-50">
                <td className="p-4 text-sm">{format(new Date(s.date), 'MMM d, yyyy')}</td>
                <td className="p-4 text-sm font-medium">{s.subject}</td>
                <td className="p-4 text-sm text-right">{s.studentCount}</td>
                <td className="p-4 text-sm text-right font-semibold text-accent">
                  {s.totalRevenue / 100}
                </td>
                <td className="p-4 text-sm text-right text-green-600">{s.teacherEarning / 100}</td>
                <td className="p-4 text-sm text-right text-blue-600">{s.ownerNet / 100}</td>
              </tr>
            ))}
            {(!sessions || sessions.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">
                  No sessions logged this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
