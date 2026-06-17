import Image from 'next/image'
import { logoutAction } from '@/app/actions/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ colorScheme: 'dark' }}>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Root Nexus" width={32} height={32} className="rounded" />
          <span className="font-semibold text-white">Dashboard</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500"
          >
            Log Out
          </button>
        </form>
      </header>
      <main className="pt-20 min-h-screen">{children}</main>
    </div>
  )
}
