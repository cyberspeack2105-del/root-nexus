import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/session'
import type { SessionPayload } from '@/types/admin'

export const verifyAdminSession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('rn_admin_session')?.value

  if (!token) {
    redirect('/rn-secure-admin/login')
  }

  const payload = await decrypt(token)
  if (!payload) {
    redirect('/rn-secure-admin/login')
  }

  return payload
})
