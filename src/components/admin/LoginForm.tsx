'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'
import type { ActionResult } from '@/types/admin'

const initialState: ActionResult = { success: false, error: '' }

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.success === false && state.error && (
        <div role="alert" className="text-red-400 text-sm text-center">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm text-gray-300">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          maxLength={64}
          required
          autoComplete="username"
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-gray-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          maxLength={128}
          required
          autoComplete="current-password"
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white text-black py-2 px-4 rounded font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
      >
        {pending ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
