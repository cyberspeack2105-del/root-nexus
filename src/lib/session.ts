import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload } from '@/types/admin'

// Defer secret validation to runtime (not build time) so Vercel builds succeed
function getSecretKey(): Uint8Array {
  const secretString = process.env.ADMIN_SESSION_SECRET
  if (!secretString) {
    throw new Error('Missing required environment variable: ADMIN_SESSION_SECRET')
  }
  const decoded = Buffer.from(secretString, 'base64')
  if (decoded.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET must be at least 32 bytes when decoded from base64'
    )
  }
  return new Uint8Array(decoded)
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecretKey())
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    })
    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      expiresAt: payload.expiresAt as string,
    }
  } catch {
    return null
  }
}

export async function createAdminSession(payload: SessionPayload): Promise<void> {
  const jwt = await encrypt(payload)
  const cookieStore = await cookies()
  cookieStore.set('rn_admin_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 28800, // 8 hours
  })
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('rn_admin_session')
}
