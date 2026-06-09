import React, { useState, useEffect } from 'react'
import { useIpcQuery, useIpcMutation } from '../hooks/useIpc'
import { Teacher } from '@shared/schemas/teacher'
import { SalaryMode, EntityStatus, ServiceLineType } from '@shared/constants'

export const Teachers = () => {
  const { data: teachers, fetch: fetchTeachers } = useIpcQuery<Teacher[]>('teacher:listByCenter')
  const { mutate: createTeacher } = useIpcMutation('teacher:create')

  const [showForm, setShowForm] = useState(false)
  const defaultCenterId = 'c1' // Stub for selected center

  useEffect(() => {
    fetchTeachers({ centerId: defaultCenterId })
  }, [fetchTeachers])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simplified stub
    await createTeacher({
      id: crypto.randomUUID(),
      name: { ar: 'مدرس جديد', en: 'New Teacher' },
      phone: '010',
      subject: 'Math',
      centerId: [defaultCenterId],
      serviceType: ServiceLineType.IN_CENTER,
      salaryType: SalaryMode.REVENUE_SHARE,
      revenueSharePercent: 50,
      status: EntityStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceId: 'dev1',
      version: 1,
      deleted: false
    })
    setShowForm(false)
    fetchTeachers({ centerId: defaultCenterId })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">Teachers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          Add Teacher
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface p-4 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">New Teacher Form (Stub)</h2>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-white px-4 py-2 rounded-md">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers?.map((t) => (
          <div key={t.id} className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="font-bold text-lg">
              {t.name.ar} / {t.name.en}
            </h3>
            <p className="text-text-muted text-sm">
              {t.subject} - {t.phone}
            </p>
            <p className="mt-2 text-sm">
              <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">
                {t.salaryType}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
