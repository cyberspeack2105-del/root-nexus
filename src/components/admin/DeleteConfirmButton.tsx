'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { deleteProjectAction } from '@/app/actions/projects'

function ConfirmButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition"
    >
      {pending ? 'Deleting...' : 'Confirm Delete'}
    </button>
  )
}

export default function DeleteConfirmButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-400 hover:text-red-300 text-sm transition"
      >
        Delete
      </button>
    )
  }

  async function handleDelete() {
    const result = await deleteProjectAction(id)
    if (result && !result.success) {
      setError(result.error)
      setConfirming(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <form action={handleDelete}>
        <ConfirmButton />
      </form>
      <button
        type="button"
        onClick={() => {
          setConfirming(false)
          setError(null)
        }}
        className="text-gray-400 hover:text-gray-200 text-sm transition"
      >
        Cancel
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
