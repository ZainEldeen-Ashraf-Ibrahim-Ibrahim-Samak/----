import React, { useState, useEffect } from 'react'
import { useIpcQuery, useIpcMutation } from '../hooks/useIpc'
import { Center } from '@shared/schemas/center'

export const Centers = () => {
  const { data: centers, fetch: fetchCenters } = useIpcQuery<Center[]>('center:list')
  const { mutate: createCenter } = useIpcMutation('center:create')

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simplified stub
    await createCenter({
      id: crypto.randomUUID(),
      name: { ar: 'مركز جديد', en: 'New Center' },
      address: 'Test Address',
      phone: '010000000',
      rentAmount: 500000,
      rentDueDay: 1,
      landlordName: 'Landlord',
      landlordPhone: '010',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceId: 'dev1',
      version: 1,
      deleted: false
    })
    setShowForm(false)
    fetchCenters()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">Centers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          Add Center
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface p-4 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">New Center Form (Stub)</h2>
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
        {centers?.map((c) => (
          <div key={c.id} className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="font-bold text-lg">
              {c.name.ar} / {c.name.en}
            </h3>
            <p className="text-text-muted text-sm">{c.address}</p>
            <p className="mt-2 text-accent font-semibold">Rent: {c.rentAmount / 100} EGP</p>
          </div>
        ))}
      </div>
    </div>
  )
}
