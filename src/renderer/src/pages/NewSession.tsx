import React from 'react'
import { useIpcMutation } from '../hooks/useIpc'
import { PaymentStatus } from '@shared/constants'

export const NewSession = () => {
  const { mutate: createSession } = useIpcMutation('session:create')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simplified stub
    await createSession({
      id: crypto.randomUUID(),
      centerId: 'c1', // Stub
      teacherId: 't1', // Stub
      date: new Date(),
      startTime: '10:00',
      durationMinutes: 120,
      subject: 'Math',
      studentCount: 15,
      pricePerStudent: 10000,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceId: 'dev1',
      version: 1,
      deleted: false
    })
    alert('Session Logged')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-accent">Log New Session</h1>
      <form
        onSubmit={handleSave}
        className="bg-surface p-6 rounded-lg border border-border space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Teacher</label>
          <select className="w-full border border-border rounded p-2 bg-background">
            <option>Select Teacher...</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Student Count</label>
            <input
              type="number"
              className="w-full border border-border rounded p-2 bg-background"
              defaultValue={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price per Student</label>
            <input
              type="number"
              className="w-full border border-border rounded p-2 bg-background"
              defaultValue={100}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-accent text-white py-3 rounded-md font-bold mt-6 hover:bg-opacity-90"
        >
          Calculate & Log Session
        </button>
      </form>
    </div>
  )
}
