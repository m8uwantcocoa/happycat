'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePetButton({ petId }: { petId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this cat? This cannot be undone.")
    if (!confirmed) return

    setLoading(true)

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh() // Refresh cache
        router.push('/dashboard') // Go back to dashboard
      } else {
        alert('Failed to delete pet. Please try again.')
      }
    } catch (error) {
      console.error(error)
      alert('Error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="font-bold text-sm bg-red-400 hover:bg-red-300 text-white py-2 px-4 border-b-4 border-red-600 hover:border-red-400 rounded disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Cat'}
    </button>
  )
}