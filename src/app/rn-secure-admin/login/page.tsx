import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/session'
import LoginForm from '@/components/admin/LoginForm'

export default async function LoginPage() {
  // Already authenticated? Redirect to dashboard
  const cookieStore = await cookies()
  const token = cookieStore.get('rn_admin_session')?.value
  if (token) {
    const session = await decrypt(token)
    if (session) redirect('/rn-secure-admin')
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
          <p className="text-gray-500 text-sm">Root Nexus Administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
