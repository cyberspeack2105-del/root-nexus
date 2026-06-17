'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { compare } from 'bcryptjs'
import { getAdminByUsername } from '@/lib/db'
import { createAdminSession, deleteAdminSession } from '@/lib/session'
import type { ActionResult } from '@/types/admin'

// In-memory rate limiter: Map<ip, { count: number; windowStart: number }>
const loginAttempts = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function loginAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Extract client IP from x-forwarded-for header (async in Next.js 15+)
  const headerStore = await headers()
  const forwarded = headerStore.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // Rate limit check
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (entry) {
    if (now - entry.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return {
          success: false,
          error: 'Too many login attempts. Please wait 15 minutes.',
        }
      }
    } else {
      // Window has expired — reset
      loginAttempts.delete(ip)
    }
  }

  const username = formData.get('username')
  const password = formData.get('password')

  // Input validation: must be non-empty strings within length limits
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length === 0 ||
    password.length === 0 ||
    username.length > 64 ||
    password.length > 128
  ) {
    return { success: false, error: 'Invalid credentials' }
  }

  // DB lookup — if user not found, increment rate limit counter
  const admin = await getAdminByUsername(username)
  if (!admin) {
    const current = loginAttempts.get(ip)
    if (current && now - current.windowStart < RATE_LIMIT_WINDOW_MS) {
      current.count++
    } else {
      loginAttempts.set(ip, { count: 1, windowStart: now })
    }
    return { success: false, error: 'Invalid credentials' }
  }

  // Password verification — if invalid, increment rate limit counter
  const isValid = await compare(password, admin.passwordHash)
  if (!isValid) {
    const current = loginAttempts.get(ip)
    if (current && now - current.windowStart < RATE_LIMIT_WINDOW_MS) {
      current.count++
    } else {
      loginAttempts.set(ip, { count: 1, windowStart: now })
    }
    return { success: false, error: 'Invalid credentials' }
  }

  // Success — clear rate limit entry and create session
  loginAttempts.delete(ip)
  await createAdminSession({
    adminId: admin.id,
    username: admin.username,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  })

  // redirect() throws internally and must NOT be inside try/catch
  redirect('/rn-secure-admin')
}

export async function logoutAction(): Promise<never> {
  await deleteAdminSession()
  redirect('/rn-secure-admin/login')
}
