'use client'

import { usePathname } from 'next/navigation'
import FloatingActions from './FloatingActions'
import AIAssistant from './AIAssistant'

export default function ClientLayoutGuard() {
  const pathname = usePathname()
  if (pathname.startsWith('/rn-secure-admin')) return null
  return (
    <>
      <FloatingActions />
      <AIAssistant />
    </>
  )
}
