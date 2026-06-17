# Implementation Plan: Secure Admin Panel

## Overview

Full implementation of the secure admin panel for the Root Nexus website. Uses MongoDB Atlas as the database, `jose` for JWT sessions, `bcryptjs` for password hashing, and `proxy.ts` for route protection. Tasks are ordered by dependency — foundational modules first, then auth, then UI, then public pages, then build verification.

## Tasks

- [x] 1. Install dependencies and configure environment
  - Run `npm install mongodb jose bcryptjs`
  - Run `npm install --save-dev @types/bcryptjs`
  - Add to `.env.local`: `MONGODB_URI=mongodb+srv://raju:raju2105@cluster0.dsttruk.mongodb.net/root2005?appName=Cluster0`, `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD_HASH` (generate bcrypt hash at cost 12), `ADMIN_SESSION_SECRET` (generate with `openssl rand -base64 32`)
  - Ensure `.env.local` is listed in `.gitignore`
  - _Requirements: 2.3, 2.4, 3.8, 12.1_

- [x] 2. Create TypeScript interfaces (`src/types/admin.ts`)
  - Define `Project` interface with fields: `_id?`, `id`, `title`, `slug`, `category`, `shortDescription`, `image`, `client`, `timeline`, `results: string[]`, `content`, `createdAt`, `updatedAt`
  - Define `AdminUser` interface with fields: `_id?`, `id`, `username`, `passwordHash`, `createdAt`
  - Define `SessionPayload` interface with fields: `adminId: string`, `username`, `expiresAt`
  - Define `ActionResult<T>` union type (`success: true` | `success: false` with `error` and optional `fieldErrors`)
  - Define `ProjectFormData` interface for form inputs
  - _Requirements: All (shared types)_

- [x] 3. Create slug utility (`src/lib/slugify.ts`)
  - Implement `slugify(title: string): string`: trim → lowercase → replace non-alphanumeric runs with `-` → strip leading/trailing hyphens → truncate to 200 chars; return `''` for empty input
  - Implement `makeUniqueSlug(title: string, existingSlugs: string[], excludeSlug?: string): string`: compute base slug, try base then base-2 through base-99, then timestamp fallback; exclude `excludeSlug` from comparison set for edit flow
  - Export both functions without `'server-only'` (pure utility, usable client-side too)
  - _Requirements: 7.3, 7.4, 8.3_

- [x] 4. Create MongoDB database module (`src/lib/db.ts`)
  - Add `'server-only'` directive
  - Implement singleton `MongoClient` connection using `global._mongoClientPromise` for Next.js HMR safety
  - Implement `connectDb(): Promise<Db>` returning the `root2005` database
  - Implement `initDb()` called at module load that: validates all 4 env vars are present (throw descriptive error for each missing one); validates `ADMIN_PASSWORD_HASH` starts with `$2b$` or `$2a$` (throw if not); validates `ADMIN_SESSION_SECRET` base64-decoded length ≥ 32 bytes (throw if not); logs `console.warn` if bcrypt cost factor < 12 but continues
  - On first connection create indexes: `admins.username` (unique), `projects.slug` (unique), `projects.created_at` (descending)
  - Seed admin: if `admins` collection is empty, insert `{ username, password_hash, created_at }`
  - Implement `getAdminByUsername(username): Promise<AdminUser | null>`
  - Implement `getAllProjects(): Promise<Project[]>` sorted by `created_at` DESC
  - Implement `getProjectBySlug(slug): Promise<Project | null>`
  - Implement `getProjectById(id): Promise<Project | null>` (id is ObjectId string)
  - Implement `getAllSlugs(): Promise<string[]>`
  - Implement `insertProject(data): Promise<Project>` setting `created_at` and `updated_at` to current UTC ISO
  - Implement `updateProjectById(id, data): Promise<Project | null>` setting `updated_at` to current UTC ISO
  - Implement `deleteProjectById(id): Promise<boolean>`
  - Convert all `_id` ObjectId values to string `id` before returning — never expose raw ObjectId to callers
  - _Requirements: 2.1–2.7, 12.1, 12.2, 12.5_

- [x] 5. Create session manager (`src/lib/session.ts`)
  - Add `'server-only'` directive
  - At module load validate `ADMIN_SESSION_SECRET` is present and base64-decoded length ≥ 32 bytes; throw descriptive error if not
  - Implement `encrypt(payload: SessionPayload): Promise<string>` using `SignJWT` with HS256 and `expiresIn: '8h'`
  - Implement `decrypt(token: string): Promise<SessionPayload | null>` using `jwtVerify` with `{ algorithms: ['HS256'] }`; return `null` on any error
  - Implement `createAdminSession(payload): Promise<void>`: call `encrypt`, then `cookies().set('rn_admin_session', jwt, { httpOnly: true, secure: NODE_ENV==='production', sameSite: 'lax', path: '/', maxAge: 28800 })`
  - Implement `deleteAdminSession(): Promise<void>`: call `cookies().delete('rn_admin_session')`
  - _Requirements: 3.3, 3.4, 3.8, 4.1, 4.2, 12.2_

- [x] 6. Create Data Access Layer (`src/lib/dal.ts`)
  - Add `'server-only'` directive
  - Implement `verifyAdminSession` wrapped in `React.cache()`: read `rn_admin_session` cookie and `redirect('/rn-secure-admin/login')` if absent; call `decrypt(token)` and `redirect('/rn-secure-admin/login')` if null; return `SessionPayload`
  - _Requirements: 5.3, 5.5_

- [x] 7. Create proxy (`proxy.ts` at project root)
  - Use named export `proxy` (not `default export`)
  - Read `rn_admin_session` cookie and call `decrypt()` — no DB calls, stateless only
  - If unauthenticated and path is NOT `/rn-secure-admin/login`: return `NextResponse.redirect` 307 to `/rn-secure-admin/login`
  - If authenticated and path IS `/rn-secure-admin/login`: return `NextResponse.redirect` 307 to `/rn-secure-admin`
  - Otherwise return `NextResponse.next()`
  - Export `config = { matcher: ['/rn-secure-admin/:path*'] }`
  - _Requirements: 1.6, 5.1, 5.2, 5.4, 5.5, 5.6, 5.7_

- [x] 8. Create auth server actions (`src/app/actions/auth.ts`)
  - Add `'use server'` directive
  - Declare in-memory rate limiter `Map<ip, { count: number; windowStart: number }>` with max 10 attempts per 15-minute window
  - Implement `loginAction(prevState: ActionResult, formData: FormData): Promise<ActionResult>`: extract IP from `x-forwarded-for`; check/enforce rate limit (return error on breach, reset on window expiry); validate username ≤ 64 chars and password ≤ 128 chars (return `{ success: false }` before any DB call if violated); call `getAdminByUsername` (increment counter + return "Invalid credentials" if not found); call `bcrypt.compare` (increment counter + return "Invalid credentials" if false); on success clear counter, call `createAdminSession`, then `redirect('/rn-secure-admin')`
  - Implement `logoutAction(): Promise<never>`: call `deleteAdminSession()` then `redirect('/rn-secure-admin/login')`
  - _Requirements: 3.1–3.9, 4.1, 4.2, 12.3_

- [x] 9. Create project server actions (`src/app/actions/projects.ts`)
  - Add `'use server'` directive
  - Implement `createProjectAction(prevState, formData)`: call `verifyAdminSession()`; validate all 8 fields (title ≤200, category ≤100, shortDescription ≤500, image valid URL ≤500, client ≤200, timeline ≤100, results ≤500 total, content ≤5000); return field-level errors without DB call if any fail; call `makeUniqueSlug(title, await getAllSlugs())`; call `insertProject` (catch DB errors and return `{ success: false, error: '...' }`); call `revalidatePath('/work')` and `revalidatePath('/')`; call `redirect('/rn-secure-admin')`
  - Implement `updateProjectAction(id, prevState, formData)`: call `verifyAdminSession()`; call `getProjectById(id)` and `notFound()` if absent; validate fields; recompute slug if title changed using `makeUniqueSlug(newTitle, await getAllSlugs(), currentSlug)`; call `updateProjectById`; call `revalidatePath` for `/work`, `/work/${oldSlug}`, `/work/${newSlug}`, `/`; call `redirect('/rn-secure-admin')`
  - Implement `deleteProjectAction(id)`: call `verifyAdminSession()`; call `getProjectById(id)` and return `{ success: false, error: 'Project not found' }` if absent; call `deleteProjectById` (catch errors); call `revalidatePath('/work')` and `revalidatePath('/')`; call `redirect('/rn-secure-admin')`
  - _Requirements: 7.1–7.8, 8.1–8.8, 9.1–9.6_

- [x] 10. Create admin UI components
  - Create `src/components/ClientLayoutGuard.tsx` (client component): use `usePathname()`; return `null` if path starts with `/rn-secure-admin`; otherwise render `<FloatingActions />` and `<AIAssistant />`
  - Create `src/components/admin/LoginForm.tsx` (client component): use `useActionState` (React 19) with `loginAction`; username field (max 64), password field (max 128); display `prevState.error` as error message; show pending state while submitting; "Log In" submit button
  - Create `src/components/admin/ProjectForm.tsx` (client component, shared create/edit): all 8 fields with client-side validation and field-level error display; accept `initialData` prop to pre-populate fields in edit mode; visible submit button label
  - Create `src/components/admin/ProjectList.tsx` (client component): table with title, category, slug, createdAt formatted as `DD MMM YYYY`; "Edit" button per row linking to `/rn-secure-admin/edit/[id]`; "Delete" button per row triggering `DeleteConfirmButton`; empty-state message when `projects.length === 0`; error message when `error` prop present
  - Create `src/components/admin/DeleteConfirmButton.tsx` (client component): "Delete" button; on click show inline confirmation dialog with "Confirm Delete" button and "Cancel" button; on confirm call `deleteProjectAction(id)` via form action; show error if deletion fails
  - _Requirements: 4.3, 6.1–6.7, 9.1–9.6_

- [x] 11. Create admin route pages
  - Create `src/app/rn-secure-admin/layout.tsx`: no Navbar, Footer, FloatingActions, AIAssistant, or Providers; hard-coded dark mode; fixed top header with `/logo.png`, "Dashboard" label, logout `<form>` calling `logoutAction`; `{children}` slot
  - Create `src/app/rn-secure-admin/login/page.tsx` (Server Component): check session cookie and redirect to `/rn-secure-admin` if already authenticated; render `<LoginForm />`
  - Create `src/app/rn-secure-admin/page.tsx` (Admin Dashboard, Server Component): call `verifyAdminSession()`; call `getAllProjects()` in try/catch; render `<ProjectList>` or error state; render "Add New Project" button linking to `/rn-secure-admin/new`
  - Create `src/app/rn-secure-admin/new/page.tsx` (Server Component): call `verifyAdminSession()`; render `<ProjectForm action={createProjectAction} />`
  - Create `src/app/rn-secure-admin/edit/[id]/page.tsx` (Server Component): call `verifyAdminSession()`; call `getProjectById(id)` and `notFound()` if null; render `<ProjectForm action={updateProjectAction.bind(null, id)} initialData={project} />`
  - _Requirements: 6.1–6.7, 7.1–7.8, 8.1–8.8, 9.1–9.6, 11.1–11.5_

- [x] 12. Modify root layout (`src/app/layout.tsx`)
  - Remove direct `<FloatingActions />` and `<AIAssistant />` usages
  - Import and render `<ClientLayoutGuard />` in their place
  - Verify `FixedLogo` import state matches the original (it was imported but not rendered — preserve that state, do not add it to the JSX if it was not there)
  - _Requirements: 11.1, 11.3_

- [x] 13. Migrate public work pages to MongoDB
  - Rewrite `src/app/work/page.tsx`: remove `'use client'` directive; remove `portfolioData` import; import `getAllProjects` from `@/lib/db`; call `const projects = await getAllProjects()` in try/catch; render error message on catch; render empty-state message when `projects.length === 0`; move Framer Motion animated card wrapper to a separate `'use client'` sub-component so the page shell is a Server Component
  - Rewrite `src/app/work/[slug]/page.tsx`: remove `generateStaticParams`; remove `portfolioData` import; import `getProjectBySlug` from `@/lib/db`; call `const project = await getProjectBySlug(slug)`; call `notFound()` if null; move animated elements to client sub-components as needed
  - _Requirements: 10.1–10.7_

- [x] 14. Add security headers to `next.config.ts`
  - Add `async headers()` function to `nextConfig` returning a rule for source `/rn-secure-admin/:path*` with headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`
  - _Requirements: 1.5, 12.4_

- [x] 15. Update `robots.ts` and `sitemap.ts`
  - Update `src/app/robots.ts`: change `disallow` to an array `['/private/', '/rn-secure-admin/']`
  - Update `src/app/sitemap.ts`: make function `async`; import `getAllProjects` from `@/lib/db`; fetch projects and map to sitemap entries with `changeFrequency: 'monthly'` and `priority: 0.7`; add `/work` page entry; never include any `/rn-secure-admin/*` paths
  - _Requirements: 1.4_

- [x] 16. Build verification
  - Run `npm run build` and confirm zero TypeScript errors and zero build errors
  - Start `npm run dev` and manually verify: `/work` loads from MongoDB; `/rn-secure-admin/login` shows the login form; unauthenticated `/rn-secure-admin` redirects to login; valid credentials set session cookie and load dashboard; dashboard shows projects with Edit/Delete/Add New; create/edit/delete cycle works end-to-end; logout clears cookie and redirects to login; `FloatingActions` and `AIAssistant` absent on all admin pages; no admin links in Navbar, Footer, or any public page
  - Verify `robots.txt` output disallows `/rn-secure-admin/`
  - Verify response headers for `/rn-secure-admin/login` include all four security headers
  - _Requirements: All_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3", "4"] },
    { "wave": 4, "tasks": ["5"] },
    { "wave": 5, "tasks": ["6", "7"] },
    { "wave": 6, "tasks": ["8", "9"] },
    { "wave": 7, "tasks": ["10"] },
    { "wave": 8, "tasks": ["11", "12", "13", "14", "15"] },
    { "wave": 9, "tasks": ["16"] }
  ]
}
```

## Notes

- **MongoDB URI**: The connection string `mongodb+srv://raju:raju2105@cluster0.dsttruk.mongodb.net/root2005?appName=Cluster0` is already confirmed working. Add it directly to `.env.local` — never commit `.env.local` to git.
- **Password hash generation**: Before running the app, generate a bcrypt hash for your admin password: `node -e "const b=require('bcryptjs');b.hash('YOUR_PASSWORD',12).then(console.log)"` and set the result as `ADMIN_PASSWORD_HASH` in `.env.local`.
- **Session secret generation**: Generate a 32-byte base64 secret: `openssl rand -base64 32` and set as `ADMIN_SESSION_SECRET` in `.env.local`.
- **proxy.ts vs middleware.ts**: Next.js 16 uses the `proxy` named export, not `default`. Do not create `middleware.ts` — it is deprecated in this version.
- **No static params**: `generateStaticParams` is removed from the work detail page because projects are now dynamic DB content, not build-time static data.
- **Framer Motion in Server Components**: Pages converted from `'use client'` to Server Components must extract `motion.*` wrappers into separate client sub-components. The page shell stays as a Server Component.
