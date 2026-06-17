# Design Document: Secure Admin Panel

## Overview

The Secure Admin Panel is a hidden, single-administrator content management interface for the Root Nexus website. It is accessible only via the direct secret URL `/rn-secure-admin/login`, with no links or references to it anywhere on the public site.

The design replaces the static `src/data/portfolio.ts` with **MongoDB Atlas** (via the `mongodb` driver) as the canonical source of project data. Authentication is handled via stateless JWTs stored in an HttpOnly cookie, signed using `jose` (HS256). Route protection is enforced by `proxy.ts` (Next.js 16's replacement for the deprecated `middleware.ts`) at the edge layer, with a secondary server-side Data Access Layer (DAL) check inside every Server Action.

Key design decisions:
- **MongoDB Atlas** — cloud-hosted, no local file required, connection via `MONGODB_URI` env var pointing to `mongodb+srv://...`. The `mongoose` ODM is **not** used — the official `mongodb` driver is used directly for minimal overhead and full control.
- **No registration flow** — the single admin credential is seeded into the `admins` collection from environment variables at startup only when the collection is empty.
- **Isolated admin layout** — the route group `src/app/rn-secure-admin/` has its own `layout.tsx` that does not inherit `FloatingActions` or `AIAssistant` from the root layout.
- **Root layout isolation** — `src/app/layout.tsx` is updated to suppress global widgets on admin routes using `usePathname` inside a `ClientLayoutGuard` client component.
- **PBT-first** — correctness properties are identified for session JWT round-trip, slug generation, slug uniqueness, and project data round-trip.

---

## Architecture

### Module Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         proxy.ts (root)                         │
│  matcher: /rn-secure-admin/:path*                               │
│  reads: cookies → session.decrypt() → redirect or next()        │
└────────────────────┬────────────────────────────────────────────┘
                     │ (no DB — stateless JWT only)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/app/rn-secure-admin/  (route group)            │
│  layout.tsx ────────────────────────────────────────────────── │
│  login/page.tsx   ← renders LoginForm client component          │
│  page.tsx         ← Admin Dashboard (server component)          │
│  new/page.tsx     ← New Project form                            │
│  edit/[id]/page.tsx ← Edit Project form                         │
└────────────┬──────────────────────────────────────────────────┘
             │ calls
             ▼
┌────────────────────────┐    ┌─────────────────────────────────┐
│  src/app/actions/      │    │  src/lib/dal.ts  (server-only)  │
│  auth.ts               │───▶│  verifyAdminSession()           │
│  loginAction()         │    │  wraps cookies() + session      │
│  logoutAction()        │    │  .decrypt(), calls redirect()   │
│                        │    │  if invalid                     │
│  projects.ts           │    └──────────────┬──────────────────┘
│  createProject()       │                   │ uses
│  updateProject()       │                   ▼
│  deleteProject()       │    ┌─────────────────────────────────┐
└────────┬───────────────┘    │  src/lib/session.ts (server-only│
         │ calls              │  encrypt() / decrypt()          │
         ▼                    │  createAdminSession()           │
┌────────────────────────┐    │  deleteAdminSession()           │
│  src/lib/db.ts         │    │  jose HS256, 8h expiry          │
│  (server-only)         │    │  cookie: rn_admin_session       │
│  connectDb()           │    └─────────────────────────────────┘
│  initDb()              │
│  getAdminByUsername()  │    ┌─────────────────────────────────┐
│  getAllProjects()       │    │  src/lib/slugify.ts             │
│  getProjectBySlug()    │    │  slugify(title)                 │
│  getProjectById()      │◀───│  makeUniqueSlug(title, slugs)   │
│  insertProject()       │    └─────────────────────────────────┘
│  updateProjectById()   │
│  deleteProjectById()   │
│  mongodb driver        │
│  Atlas: root2005 db    │
└────────────────────────┘
         ▲
         │ reads (server components)
┌────────────────────────┐
│  src/app/work/         │
│  page.tsx              │  (migrated — no more portfolioData import)
│  [slug]/page.tsx       │
└────────────────────────┘
```

### Request Flow — Authentication

```
Browser                  proxy.ts              Admin Page / Action
  │                         │                         │
  │ GET /rn-secure-admin    │                         │
  │────────────────────────▶│                         │
  │                         │ read cookie             │
  │                         │ session.decrypt()       │
  │                         │   ┌─ invalid/absent ──▶ 307 /rn-secure-admin/login
  │                         │   └─ valid ─────────────────────────────────────▶│
  │                         │                         │ verifyAdminSession()   │
  │                         │                         │ (DAL secondary check)  │
  │                         │                         │   ┌─ fail ──▶ redirect │
  │                         │                         │   └─ pass ──▶ render   │
  │◀────────────────────────────────────────────────────── 200 dashboard HTML  │
```

### Request Flow — Login

```
Browser              LoginForm          loginAction()         session.ts         db.ts
  │                      │                   │                    │                │
  │ submit form          │                   │                    │                │
  │─────────────────────▶│                   │                    │                │
  │                      │ Server Action     │                    │                │
  │                      │──────────────────▶│                    │                │
  │                      │                   │ validateInput()    │                │
  │                      │                   │ checkRateLimit()   │                │
  │                      │                   │────────────────────────────────────▶│
  │                      │                   │ getAdminByUsername │                │
  │                      │                   │◀────────────────────────────────────│
  │                      │                   │ bcrypt.compare()   │                │
  │                      │                   │ createAdminSession │                │
  │                      │                   │───────────────────▶│                │
  │                      │                   │                    │ SignJWT        │
  │                      │                   │                    │ cookies().set()│
  │                      │                   │ redirect('/rn-secure-admin')        │
  │◀─────────────────────────────────────────── 303 + Set-Cookie                  │
```

### Request Flow — Create Project

```
Browser          NewProjectPage       createProject()        slugify.ts         db.ts
  │                   │                    │                     │                │
  │ submit form       │                    │                     │                │
  │──────────────────▶│                    │                     │                │
  │                   │ Server Action      │                     │                │
  │                   │───────────────────▶│                     │                │
  │                   │                    │ verifyAdminSession() (DAL)           │
  │                   │                    │ validateFields()     │                │
  │                   │                    │─────────────────────▶│               │
  │                   │                    │ makeUniqueSlug()     │               │
  │                   │                    │◀─────────────────────│               │
  │                   │                    │────────────────────────────────────▶ │
  │                   │                    │ insertProject()       │               │
  │                   │                    │◀────────────────────────────────────  │
  │                   │                    │ revalidatePath('/work')               │
  │                   │                    │ revalidatePath('/')                   │
  │                   │                    │ redirect('/rn-secure-admin')          │
  │◀──────────────────────────────────────── 303                                  │
```

---

## Components and Interfaces

### TypeScript Interfaces

```typescript
// src/types/admin.ts
import type { ObjectId } from 'mongodb'

export interface Project {
  _id?: ObjectId;         // MongoDB document ID (absent before insert)
  id: string;             // string form of _id, used in URLs and Server Actions
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  image: string;
  client: string;
  timeline: string;
  results: string[];      // stored as BSON array in MongoDB
  content: string;
  createdAt: string;      // ISO 8601 UTC string
  updatedAt: string;      // ISO 8601 UTC string
}

export interface AdminUser {
  _id?: ObjectId;
  id: string;             // string form of _id
  username: string;
  passwordHash: string;   // bcrypt hash ($2b$ or $2a$ prefix)
  createdAt: string;
}

export interface SessionPayload {
  adminId: string;        // string ObjectId of the admin document
  username: string;
  expiresAt: string;      // ISO 8601 UTC string
}

// Server Action result shapes
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface ProjectFormData {
  title: string;
  category: string;
  shortDescription: string;
  image: string;
  client: string;
  timeline: string;
  results: string;        // comma-separated on form; split to string[] before DB write
  content: string;
}
```

### New File Tree

```
project root/
├── proxy.ts                                    ← NEW (replaces middleware.ts)
├── src/
│   ├── types/
│   │   └── admin.ts                           ← NEW
│   ├── lib/
│   │   ├── db.ts                              ← NEW (mongodb driver module)
│   │   ├── session.ts                         ← NEW (jose JWT, server-only)
│   │   ├── dal.ts                             ← NEW (DAL, server-only)
│   │   └── slugify.ts                         ← NEW (pure slug utility)
│   ├── app/
│   │   ├── layout.tsx                         ← MODIFIED (admin route isolation)
│   │   ├── robots.ts                          ← MODIFIED (disallow /rn-secure-admin/)
│   │   ├── sitemap.ts                         ← MODIFIED (exclude admin paths, add /work/* entries)
│   │   ├── actions/
│   │   │   ├── auth.ts                        ← NEW (loginAction, logoutAction)
│   │   │   └── projects.ts                    ← NEW (createProject, updateProject, deleteProject)
│   │   ├── work/
│   │   │   ├── page.tsx                       ← MODIFIED (DB read instead of portfolioData)
│   │   │   └── [slug]/
│   │   │       └── page.tsx                   ← MODIFIED (DB read + remove generateStaticParams)
│   │   └── rn-secure-admin/
│   │       ├── layout.tsx                     ← NEW (isolated layout)
│   │       ├── page.tsx                       ← NEW (Admin Dashboard)
│   │       ├── login/
│   │       │   └── page.tsx                   ← NEW (Login page)
│   │       ├── new/
│   │       │   └── page.tsx                   ← NEW (New Project form page)
│   │       └── edit/
│   │           └── [id]/
│   │               └── page.tsx               ← NEW (Edit Project form page)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── LoginForm.tsx                  ← NEW (client component)
│   │   │   ├── ProjectForm.tsx                ← NEW (client component, shared create/edit)
│   │   │   ├── ProjectList.tsx                ← NEW (client component)
│   │   │   └── DeleteConfirmButton.tsx        ← NEW (client component)
│   │   └── ClientLayoutGuard.tsx              ← NEW (suppresses FloatingActions/AIAssistant on admin routes)
├── next.config.ts                             ← MODIFIED (security headers, image domains)
└── .env.local                                 ← MODIFIED (add 4 env vars)
```

**Files NOT created:**
- `src/data/portfolio.ts` is retained as-is (migration reference only; not imported anywhere after migration)
- No `middleware.ts` — Next.js 16 uses `proxy.ts`
- No local database file — MongoDB Atlas is the cloud store

---

## Data Models

### MongoDB Collections

#### `admins` collection

```typescript
// Document shape stored in MongoDB
{
  _id: ObjectId,
  username: string,          // unique index
  password_hash: string,     // bcrypt hash
  created_at: string,        // ISO 8601 UTC
}
```

Indexes:
- `{ username: 1 }` — unique, for login lookup

#### `projects` collection

```typescript
// Document shape stored in MongoDB
{
  _id: ObjectId,
  title: string,
  slug: string,              // unique index
  category: string,
  short_description: string,
  image: string,
  client: string,
  timeline: string,
  results: string[],         // native BSON array — no JSON serialization needed
  content: string,
  created_at: string,        // ISO 8601 UTC
  updated_at: string,        // ISO 8601 UTC
}
```

Indexes:
- `{ slug: 1 }` — unique, for `/work/[slug]` lookups
- `{ created_at: -1 }` — for ordered dashboard listing

### `src/lib/db.ts` — Database Module

Marked `'server-only'`. Uses the official `mongodb` npm package. Implements a **singleton client** pattern safe for Next.js hot reload (stores client on `global` in development to survive HMR).

On module load, `connectDb()` is called which:

1. Validates `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` are all present. Throws a descriptive `Error` identifying any missing variable.
2. Validates `ADMIN_PASSWORD_HASH` starts with `$2b$` or `$2a$`. Throws if not.
3. Validates `ADMIN_SESSION_SECRET` decoded from base64 is ≥ 32 bytes. Throws if not.
4. Connects `MongoClient` to `MONGODB_URI`.
5. Ensures the `admins` and `projects` collections exist and creates indexes if not already present.
6. If the `admins` collection is empty, seeds the single admin record from env vars. Logs a `console.warn` if bcrypt cost factor < 12 but continues.

```typescript
// Connection singleton pattern (Next.js safe)
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI!)
    global._mongoClientPromise = client.connect()
  }
  return global._mongoClientPromise
}

export async function connectDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db('root2005')   // database name from the Atlas URI
}
```

Exported async functions (all use `await connectDb()`):

```typescript
// Read
getAdminByUsername(username: string): Promise<AdminUser | null>
getAllProjects(): Promise<Project[]>             // sorted by created_at DESC
getProjectBySlug(slug: string): Promise<Project | null>
getProjectById(id: string): Promise<Project | null>   // id = ObjectId string
getAllSlugs(): Promise<string[]>

// Write
insertProject(data: Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>
updateProjectById(id: string, data: Partial<Omit<Project, '_id' | 'id' | 'createdAt'>>): Promise<Project | null>
deleteProjectById(id: string): Promise<boolean>
```

All operations use the MongoDB driver's native async API. `ObjectId` values are converted to `string` before returning to callers so no `ObjectId` leaks into Server Components or client code.

### `src/lib/session.ts` — Session Manager

Marked `'server-only'`. Uses `jose` (HS256).

```typescript
// Environment validation at module load time
// Throws if ADMIN_SESSION_SECRET is absent or decoded length < 32 bytes

export async function encrypt(payload: SessionPayload): Promise<string>
// SignJWT, alg HS256, expiresIn '8h', returns compact JWT string

export async function decrypt(token: string): Promise<SessionPayload | null>
// jwtVerify with { algorithms: ['HS256'] }, returns null on any error

export async function createAdminSession(payload: SessionPayload): Promise<void>
// calls encrypt(), then cookies().set('rn_admin_session', jwt, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'lax',
//   path: '/',
//   maxAge: 28800,  // 8 hours
// })

export async function deleteAdminSession(): Promise<void>
// cookies().delete('rn_admin_session')
```

### `src/lib/dal.ts` — Data Access Layer

Marked `'server-only'`. Called at the start of every Server Action and Server Component that requires authentication.

```typescript
import { cache } from 'react'

export const verifyAdminSession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('rn_admin_session')?.value
  if (!token) redirect('/rn-secure-admin/login')

  const payload = await decrypt(token)
  if (!payload) redirect('/rn-secure-admin/login')

  return payload
})
```

The `cache()` wrapper de-duplicates JWT verification within a single request even if multiple Server Components call `verifyAdminSession()`.

### `src/lib/slugify.ts` — Slug Utility

Pure functions, no side effects. Importable in server and client contexts.

```typescript
export function slugify(title: string): string
// 1. Trim whitespace
// 2. Lowercase
// 3. Replace any sequence of non-alphanumeric characters with a single hyphen
// 4. Strip leading/trailing hyphens
// 5. Truncate to 200 characters
// Returns '' for empty/whitespace-only input

export function makeUniqueSlug(title: string, existingSlugs: string[], excludeSlug?: string): string
// 1. Compute base = slugify(title)
// 2. Build candidate set = existingSlugs minus excludeSlug (edit flow)
// 3. If base not in candidate set, return base
// 4. Try base-2 through base-99; return first not in candidate set
// 5. If all -2..-99 are taken, append timestamp suffix as fallback
```

---

## proxy.ts

Located at the project root (same level as `next.config.ts`). Named export `proxy`, not `default`.

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/rn-secure-admin/login'

  const token = request.cookies.get('rn_admin_session')?.value
  const session = token ? await decrypt(token) : null
  const isAuthenticated = session !== null

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(
      new URL('/rn-secure-admin/login', request.url),
      307
    )
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(
      new URL('/rn-secure-admin', request.url),
      307
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rn-secure-admin/:path*'],
}
```

The proxy does **not** import `db.ts` or make any MongoDB queries — it reads only the JWT cookie, keeping it stateless and fast.

---

## Admin Route Group

### `src/app/rn-secure-admin/layout.tsx`

Completely isolated layout. Does NOT import `Navbar`, `Footer`, `FloatingActions`, or `AIAssistant`. Renders:

- A fixed top header with the Root Nexus logo, a "Dashboard" label, and a logout `<form>` button (Server Action).
- The `{children}` slot.
- Dark-mode color tokens hard-coded (forced dark, no OS preference respected — Requirement 11.4).
- No `Providers` wrapper.

### Root Layout Isolation

A thin client component suppresses `FloatingActions`/`AIAssistant` on admin routes without converting the Server Component root layout to a client component:

```typescript
// src/components/ClientLayoutGuard.tsx
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
```

In `src/app/layout.tsx`, the two direct component usages are replaced with `<ClientLayoutGuard />`.

---

## Server Actions

### `src/app/actions/auth.ts`

```typescript
'use server'
import { redirect } from 'next/navigation'
import { compare } from 'bcryptjs'
import { getAdminByUsername } from '@/lib/db'
import { createAdminSession, deleteAdminSession } from '@/lib/session'

// In-memory rate limiter: Map<ip, { count: number; windowStart: number }>
const loginAttempts = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
```

`loginAction` flow:
1. Extract IP from `headers().get('x-forwarded-for')` (first IP) or `'unknown'`.
2. Check rate limit — if count ≥ 10 in current window, return `{ success: false, error: 'Too many login attempts. Please wait 15 minutes.' }`. Reset counter if window expired.
3. Validate: username ≤ 64 chars, password ≤ 128 chars. Return error if violated (no DB call).
4. `getAdminByUsername(username)` — if not found, increment counter, return "Invalid credentials".
5. `bcrypt.compare(password, admin.passwordHash)` — if false, increment counter, return "Invalid credentials".
6. On success: clear rate limit entry, call `createAdminSession({ adminId, username, expiresAt })`.
7. `redirect('/rn-secure-admin')`.

`logoutAction`:
- `deleteAdminSession()` then `redirect('/rn-secure-admin/login')`.

### `src/app/actions/projects.ts`

```typescript
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/dal'
import { insertProject, updateProjectById, deleteProjectById, getProjectById, getAllSlugs } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
```

`createProjectAction`:
1. `verifyAdminSession()` — redirects if invalid.
2. Validate all 8 fields against constraints.
3. `makeUniqueSlug(title, await getAllSlugs())`.
4. `insertProject(...)`.
5. `revalidatePath('/work')`, `revalidatePath('/')`.
6. `redirect('/rn-secure-admin')`.

`updateProjectAction(id, prevState, formData)`:
1. `verifyAdminSession()`.
2. `getProjectById(id)` — `notFound()` if absent.
3. Validate fields.
4. If title changed: `makeUniqueSlug(title, await getAllSlugs(), currentSlug)`.
5. `updateProjectById(id, ...)`.
6. `revalidatePath('/work')`, `revalidatePath('/work/${oldSlug}')`, `revalidatePath('/work/${newSlug}')`, `revalidatePath('/')`.
7. `redirect('/rn-secure-admin')`.

`deleteProjectAction(id)`:
1. `verifyAdminSession()`.
2. `getProjectById(id)` — return 404 ActionResult if absent.
3. `deleteProjectById(id)`.
4. `revalidatePath('/work')`, `revalidatePath('/')`.
5. `redirect('/rn-secure-admin')`.

---

## Security Headers

`next.config.ts` updated with a `headers()` function:

```typescript
async headers() {
  return [
    {
      source: '/rn-secure-admin/:path*',
      headers: [
        { key: 'X-Frame-Options',       value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy',        value: 'no-referrer' },
        { key: 'X-Robots-Tag',           value: 'noindex, nofollow' },
      ],
    },
  ]
},
```

---

## Environment Variables

Four variables required in `.env.local`:

```bash
# MongoDB Atlas connection string (database: root2005)
MONGODB_URI=mongodb+srv://raju:<password>@cluster0.dsttruk.mongodb.net/root2005?appName=Cluster0

# Single admin username
ADMIN_USERNAME=admin

# bcrypt hash of the admin password (cost ≥ 12 recommended)
# Generate: node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(console.log)"
ADMIN_PASSWORD_HASH=$2b$12$...

# Base64-encoded ≥32-byte secret for JWT signing
# Generate: openssl rand -base64 32
ADMIN_SESSION_SECRET=<base64_string>
```

None are prefixed `NEXT_PUBLIC_` — they are never exposed to the client bundle.

---

## Public Work Pages Migration

### `src/app/work/page.tsx`

- Convert from `'use client'` to a Server Component (remove directive; outer motion wrapper removed; inner card motion wrappers remain as a sub-client-component).
- Replace `import { portfolioData } from '@/data/portfolio'` with `import { getAllProjects } from '@/lib/db'`.
- Call `const projects = await getAllProjects()` inside the async Server Component.
- Wrap in try/catch — render error message on failure.
- Render empty-state message when `projects.length === 0`.

### `src/app/work/[slug]/page.tsx`

- Remove `generateStaticParams` — projects are dynamic DB content now.
- Replace `portfolioData.find(...)` with `await getProjectBySlug(slug)`.
- Retain `notFound()` for missing slug.

---

## robots.ts and sitemap.ts Updates

### `robots.ts`

```typescript
disallow: ['/private/', '/rn-secure-admin/'],
```

### `sitemap.ts`

Becomes `async`. Fetches project slugs/updatedAt from MongoDB:

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects()
  const projectRoutes = projects.map(p => ({
    url: `${baseUrl}/work/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  return [ /* existing static routes */, ...projectRoutes ]
}
```

---

## Correctness Properties

### Property 1: Session JWT Round-Trip Integrity

*For any* valid `SessionPayload`, `encrypt(payload)` followed by `decrypt(token)` must return a payload with all fields equal to the original. Algorithm must be HS256; expiry must be ~8 hours from signing time.

**Validates: Requirement 3.3**

### Property 2: Slugify Output Invariants

*For any* non-empty string `title`, `slugify(title)` must produce a string that:
- contains only `[a-z0-9-]`
- has no consecutive hyphens (`--`)
- does not start or end with a hyphen
- has length ≤ 200

**Validates: Requirement 7.3**

### Property 3: Slug Uniqueness

*For any* set of existing slugs `S` and title `t` whose base slug conflicts with a member of `S`, `makeUniqueSlug(t, S)` must return a slug that is not in `S`.

**Validates: Requirement 7.4**

### Property 4: Project Data Round-Trip Integrity

*For any* valid `ProjectFormData`, `insertProject(data)` followed by `getProjectBySlug(data.slug)` must return a `Project` whose field values are identical to those written (title, slug, category, shortDescription, image, client, timeline, results array members, content).

**Validates: Requirement 10.6**

### Property 5: Input Validation Rejects Over-Length Inputs

*For any* username string of length > 64 or password string of length > 128, `loginAction` must return `{ success: false }` without performing any DB query or bcrypt comparison.

**Validates: Requirements 3.6, 3.7**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Missing env var at startup | `connectDb()` throws `Error('Missing env var: MONGODB_URI')` etc; process does not start |
| Invalid `ADMIN_PASSWORD_HASH` format | Throws `Error('ADMIN_PASSWORD_HASH must start with $2b$ or $2a$')` |
| `ADMIN_SESSION_SECRET` < 32 bytes | `session.ts` throws `Error('ADMIN_SESSION_SECRET must be ≥ 32 bytes decoded')` |
| MongoDB connection failure | `connectDb()` rejects; error bubbles to Next.js error boundary |
| JWT verification failure in proxy | `decrypt()` returns `null`; proxy redirects 307 to login |
| JWT verification failure in DAL | `verifyAdminSession()` calls `redirect('/rn-secure-admin/login')` |
| MongoDB insertion error | `createProjectAction` catches, returns `{ success: false, error: 'Failed to save project' }`; no redirect |
| Update/delete on non-existent ID | `notFound()` or 404 ActionResult returned |
| Rate limit exceeded | `loginAction` returns `{ success: false, error: 'Too many login attempts. Please wait 15 minutes.' }` |
| Bcrypt cost factor < 12 | `console.warn(...)` at startup — app continues |
| DB read error on `/work` page | try/catch in Server Component renders error message |

---

## Dependencies to Install

```bash
npm install mongodb jose bcryptjs
npm install --save-dev @types/bcryptjs
```

No `@types/mongodb` needed — the `mongodb` package ships its own TypeScript types.
No `mongoose` — the native driver is used directly for minimal overhead.
