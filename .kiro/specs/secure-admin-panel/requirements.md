# Requirements Document

## Introduction

Root Nexus requires a hidden admin panel that is completely invisible to public visitors of the website. The feature enables the single Root Nexus administrator to securely log in via a secret URL, manage portfolio projects (create, edit, delete), and log out — all without any public-facing link, button, or reference to an admin area existing anywhere on the site.

The admin panel must be built on Next.js 16 App Router conventions, using `proxy.ts` (not the deprecated `middleware.ts`) for route protection, stateless JWT sessions via the `jose` library, bcrypt password hashing, and a persistent database (SQLite via `better-sqlite3`) to store credentials and project data. Projects managed through the admin panel replace the current static `src/data/portfolio.ts` as the source of truth for the public `/work` page.

## Glossary

- **Admin_Panel**: The protected area of the website accessible only to the authenticated administrator, rooted at `/rn-secure-admin`.
- **Admin_Login_Page**: The hidden login form at the secret URL `/rn-secure-admin/login`, not linked from anywhere on the public site.
- **Secret_URL**: The direct URL path `/rn-secure-admin/login` that provides the only entry point to the admin area.
- **Administrator**: The single Root Nexus operator account; no other user accounts exist.
- **Session**: A stateless, server-signed JWT stored in an HttpOnly cookie named `rn_admin_session`.
- **Session_Manager**: The server-side module (`src/lib/session.ts`) responsible for creating, validating, refreshing, and deleting sessions.
- **Auth_Actions**: The Server Actions module (`src/app/actions/auth.ts`) responsible for login and logout logic.
- **Project**: A portfolio item with fields: `id`, `title`, `slug`, `category`, `shortDescription`, `image`, `client`, `timeline`, `results` (JSON array), `content`, `createdAt`, `updatedAt`.
- **Project_Store**: The SQLite database module (`src/lib/db.ts`) that persists and retrieves Project records.
- **Proxy**: The Next.js 16 `proxy.ts` file at the project root that intercepts all requests and enforces authentication on admin routes.
- **DAL**: Data Access Layer — `src/lib/dal.ts` — the server-only module that verifies the session and provides authenticated data access.
- **Public_Website**: All routes outside `/rn-secure-admin/*`, including `/`, `/about`, `/services`, `/work`, `/insights`.
- **Admin_Dashboard**: The page at `/rn-secure-admin` that the administrator sees after login, showing the list of projects with management actions.
- **Slug_Generator**: The utility that derives a URL-safe slug from a project title.

---

## Requirements

### Requirement 1: Secret Admin Entry Point

**User Story:** As the Root Nexus administrator, I want to access the admin login page only through a direct secret URL, so that public visitors have no way to discover or reach the admin area.

#### Acceptance Criteria

1. THE Public_Website SHALL contain zero links, buttons, menu items, or text referencing the Admin_Panel or Admin_Login_Page in the Navbar, Footer, or any page component.
2. WHEN a visitor navigates to any Public_Website route, THE Public_Website SHALL render no element that reveals the existence of the Admin_Panel.
3. THE Admin_Login_Page SHALL be accessible only by directly visiting the Secret_URL `/rn-secure-admin/login`, and the Secret_URL SHALL successfully serve the login form when visited.
4. THE robots.ts and sitemap.ts files SHALL exclude all `/rn-secure-admin/*` paths from crawling and indexing.
5. IF a search engine crawler requests `/rn-secure-admin/login`, THEN THE Admin_Login_Page SHALL respond with an HTTP `X-Robots-Tag: noindex, nofollow` header.
6. WHEN a request is made to any `/rn-secure-admin/*` path that is not explicitly defined as an admin route, THE Proxy SHALL redirect the request to `/rn-secure-admin/login` with an HTTP 307 status.

---

### Requirement 2: Single Administrator Account

**User Story:** As the Root Nexus administrator, I want there to be exactly one admin account with no registration capability, so that unauthorized parties cannot create admin credentials.

#### Acceptance Criteria

1. THE Project_Store SHALL contain exactly one administrator record in the `admins` table at all times.
2. THE system SHALL provide no registration page, no sign-up form, and no API endpoint that creates additional admin accounts.
3. WHEN application initialization occurs and the `admins` table is empty, THE Project_Store SHALL seed the administrator record using values read from environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`.
4. IF `ADMIN_USERNAME` or `ADMIN_PASSWORD_HASH` is absent or empty at startup, THEN THE system SHALL throw a descriptive error indicating which variable is missing and prevent the application from starting.
5. WHEN the administrator record is written to the `admins` table, THE Project_Store SHALL store the password exclusively as the bcrypt hash provided in `ADMIN_PASSWORD_HASH`; the plaintext password SHALL never be persisted.
6. IF the detected cost factor of `ADMIN_PASSWORD_HASH` is below 12, THEN THE system SHALL log a security warning at startup but SHALL complete startup and serve requests normally.
7. IF the `admins` table already contains one or more records during initialization, THEN THE Project_Store SHALL skip the seed step without throwing an error.

---

### Requirement 3: Admin Authentication — Login

**User Story:** As the Root Nexus administrator, I want to log in with my username and password on the hidden login page, so that I can access the admin dashboard securely.

#### Acceptance Criteria

1. WHEN the administrator submits the login form with a valid username and matching password, THE Auth_Actions SHALL create a Session cookie and redirect the administrator to `/rn-secure-admin`.
2. WHEN the administrator submits the login form with an invalid username or incorrect password, THE Auth_Actions SHALL return a generic error message "Invalid credentials" without specifying which field failed.
3. THE Session_Manager SHALL sign the Session JWT using the `ADMIN_SESSION_SECRET` environment variable with algorithm HS256 and set an expiry of 8 hours.
4. WHERE the application is running in production (NODE_ENV equals "production"), THE Session cookie SHALL be set with flags `HttpOnly: true`, `SameSite: lax`, `Path: /`, `Secure: true`, and a `Max-Age` of 28800 seconds; in non-production environments `Secure` MAY be omitted.
5. WHILE an unexpired Session JWT with a verifiable HS256 signature exists in the browser, THE Admin_Login_Page SHALL redirect the administrator to `/rn-secure-admin` instead of rendering the login form.
6. THE login form SHALL enforce server-side validation: username must be a non-empty string of at most 64 characters; password must be a non-empty string of at most 128 characters.
7. IF the submitted username or password exceeds the defined length limits, THEN THE Auth_Actions SHALL reject the request with an HTTP 400 response before performing any database lookup.
8. IF `ADMIN_SESSION_SECRET` is absent or empty at startup, THEN THE system SHALL throw a descriptive error indicating the missing variable and prevent the application from starting.
9. WHEN an IP address submits the login form and exceeds 10 failed attempts within a 15-minute fixed window, THE Auth_Actions SHALL return an HTTP 429 response with a message indicating the cooldown period for all subsequent attempts within that window.

---

### Requirement 4: Admin Authentication — Logout

**User Story:** As the Root Nexus administrator, I want to log out from the admin panel, so that my session is invalidated and the browser cookie is removed.

#### Acceptance Criteria

1. WHEN the administrator activates the logout action, THE Auth_Actions SHALL delete the Session cookie (`rn_admin_session`) from the browser.
2. WHEN the Session cookie has been deleted, THE Auth_Actions SHALL redirect the administrator to `/rn-secure-admin/login`.
3. THE logout action SHALL be a Server Action invoked by a keyboard-focusable button with a visible text label in the Admin_Dashboard UI.
4. IF the browser sends a request to any `/rn-secure-admin/*` route with an absent cookie or a cookie that does not match a valid session, THEN THE Proxy SHALL redirect the request to `/rn-secure-admin/login`.

---

### Requirement 5: Route Protection via Proxy

**User Story:** As the Root Nexus administrator, I want all admin routes to be automatically protected, so that unauthenticated users are always redirected before any admin page renders.

#### Acceptance Criteria

1. THE Proxy SHALL intercept all requests matching the path pattern `/rn-secure-admin/:path*`.
2. WHEN an unauthenticated request (absent, expired, or cryptographically invalid Session JWT) is made to any route matching `/rn-secure-admin/:path*` except `/rn-secure-admin/login`, THE Proxy SHALL redirect the request to `/rn-secure-admin/login` with an HTTP 307 status.
3. WHEN a request reaches an admin Server Component or Server Action, THE DAL SHALL perform a secondary authentication check; IF the Session JWT is absent, expired, or invalid, THEN THE DAL SHALL redirect the request to `/rn-secure-admin/login` with an HTTP 307 status, ensuring unauthenticated access is denied even if the Proxy is bypassed.
4. WHEN an authenticated request is made to `/rn-secure-admin/login`, THE Proxy SHALL redirect the request to `/rn-secure-admin` with an HTTP 307 status.
5. WHEN a request arrives at the Proxy, THE Proxy SHALL read and validate the Session cookie using `Session_Manager.decrypt()` without making any database queries.
6. THE Proxy matcher SHALL exclude `/_next/static`, `/_next/image`, `/_next/data`, `api`, `favicon.ico`, `sitemap.xml`, and `robots.txt` paths from Proxy execution.
7. IF the Session JWT is expired or cryptographically invalid, THEN THE Proxy SHALL treat the request as unauthenticated and redirect to `/rn-secure-admin/login`.

---

### Requirement 6: Admin Dashboard — Project Listing

**User Story:** As the Root Nexus administrator, I want to see all portfolio projects listed in the Admin_Dashboard, so that I can manage them from a central location.

#### Acceptance Criteria

1. WHEN the authenticated administrator navigates to `/rn-secure-admin`, THE Admin_Dashboard SHALL display a list of all Projects ordered by `createdAt` descending.
2. THE Admin_Dashboard SHALL display the following fields for each Project in the list: `title`, `category`, `slug`, and the `createdAt` date formatted as `DD MMM YYYY`.
3. WHEN the Admin_Dashboard renders a Project row, THE Admin_Dashboard SHALL render an "Edit" button and a "Delete" button, each with a visible, non-empty text label, for that Project.
4. WHEN the Admin_Dashboard renders, THE Admin_Dashboard SHALL render an "Add New Project" button with a visible, non-empty text label.
5. WHILE the Project_Store contains zero projects, THE Admin_Dashboard SHALL display a message indicating no projects exist.
6. WHEN the first project is added while the empty-state message is displayed, THE Admin_Dashboard SHALL switch to displaying the project list within 1 second without requiring a full page reload.
7. IF the Project_Store returns an error when the Admin_Dashboard fetches the project list, THEN THE Admin_Dashboard SHALL display an error message indicating the list could not be loaded.

---

### Requirement 7: Admin Dashboard — Create Project

**User Story:** As the Root Nexus administrator, I want to create a new portfolio project through the admin panel, so that it appears on the public Work page.

#### Acceptance Criteria

1. WHEN the administrator submits a valid create project form and the Project_Store persists the record successfully, THE Admin_Dashboard SHALL redirect the administrator to `/rn-secure-admin`.
2. THE create project form SHALL include input fields for: `title` (required, max 200 characters), `category` (required, max 100 characters), `shortDescription` (required, max 500 characters), `image` (required well-formed URL with scheme and host, max 500 characters), `client` (required, max 200 characters), `timeline` (required, max 100 characters), `results` (required, comma-separated values max 500 characters total, rendered as individual entries), and `content` (required textarea, max 5000 characters).
3. THE Slug_Generator SHALL automatically derive the `slug` from the `title` by converting to lowercase, replacing non-alphanumeric characters with hyphens, collapsing consecutive hyphens, and truncating to a maximum of 200 characters; the Slug_Generator SHALL compare the generated slug against existing project slugs in the Project_Store to detect conflicts.
4. IF a project with the same `slug` already exists in the Project_Store, THEN THE Admin_Dashboard SHALL append a numeric suffix in the range `-2` through `-99` to produce a unique slug.
5. IF any required field is missing or violates its length constraint, THEN THE Admin_Dashboard SHALL display a field-level validation error and SHALL NOT submit the form to the server.
6. THE `createdAt` and `updatedAt` fields SHALL be set to the current UTC timestamp by the Project_Store at the time of insertion.
7. WHEN a new Project is created, THE Admin_Dashboard SHALL revalidate the `/work` and `/` public page caches so that the new project appears without requiring a server restart; IF cache revalidation fails, THEN THE Admin_Dashboard SHALL log the error but SHALL still redirect to `/rn-secure-admin`.
8. IF the Project_Store returns an error during insertion, THEN THE Admin_Dashboard SHALL display an error message indicating the project could not be saved and SHALL NOT redirect.

---

### Requirement 8: Admin Dashboard — Edit Project

**User Story:** As the Root Nexus administrator, I want to edit an existing portfolio project, so that I can update its content and have the public site reflect the changes immediately.

#### Acceptance Criteria

1. WHEN the administrator navigates to the edit page for a Project, THE Admin_Dashboard SHALL pre-populate all eight form fields (`title`, `category`, `shortDescription`, `image`, `client`, `timeline`, `results`, `content`) with the Project's current values.
2. WHEN the administrator submits an edit form where all fields satisfy the constraints defined in Requirement 7 Criterion 2, THE Admin_Dashboard SHALL update the Project record in the Project_Store and redirect to `/rn-secure-admin`.
3. IF the `title` field differs from the Project's currently stored title, THEN THE Slug_Generator SHALL recompute the slug applying uniqueness logic as defined in Requirement 7 Criterion 4, excluding the current project's own slug from the uniqueness check.
4. THE `updatedAt` field SHALL be set to the current UTC timestamp by the Project_Store at the time of update.
5. IF the administrator navigates to the edit page for a Project `id` that does not exist in the Project_Store, THEN THE Admin_Dashboard SHALL render a Not Found page using Next.js `notFound()` without modifying any data.
6. IF a Server Action receives an edit submission for a Project `id` that does not exist in the Project_Store, THEN THE Admin_Dashboard SHALL return a 404 response without modifying the Project_Store.
7. WHEN a Project is updated, THE Admin_Dashboard SHALL revalidate the `/work`, `/work/[slug]` (including the old slug if the title changed), and `/` public page caches.
8. IF any required form field is missing or violates its length constraint on the edit form, THEN THE Admin_Dashboard SHALL display a field-level validation error and SHALL NOT submit the form to the server.

---

### Requirement 9: Admin Dashboard — Delete Project

**User Story:** As the Root Nexus administrator, I want to delete a portfolio project from the admin panel, so that it is permanently removed from the public site.

#### Acceptance Criteria

1. WHEN the administrator confirms deletion of a Project by submitting a confirmation dialog, THE Admin_Dashboard SHALL permanently remove the Project record from the Project_Store.
2. THE Admin_Dashboard SHALL present a confirmation dialog requiring an explicit affirmative action (a dedicated confirm button distinct from any cancel control) before initiating deletion of a Project.
3. WHEN a Project is successfully deleted, THE Admin_Dashboard SHALL redirect the administrator to `/rn-secure-admin` and display a success message indicating the project was deleted.
4. IF the Project with the given `id` does not exist at deletion time, THEN THE Admin_Dashboard SHALL return a not-found error response without modifying the Project_Store.
5. WHEN a Project is deleted, THE system SHALL update the `/work` and `/` public pages so that the deleted Project no longer appears in any page listing or detail route.
6. IF the Project_Store returns an error during deletion, THEN THE Admin_Dashboard SHALL display an error message indicating the deletion failed and leave the Project record unchanged in the Project_Store.

---

### Requirement 10: Public Project Display — Read-Only Access

**User Story:** As a public visitor, I want to view portfolio projects on the Work page, so that I can browse Root Nexus's work without any access to admin controls.

#### Acceptance Criteria

1. THE Public_Website SHALL display Projects from the Project_Store on the `/work` page ordered by `createdAt` descending, replacing the static `portfolioData` import from `src/data/portfolio.ts`.
2. WHEN the Project_Store returns zero projects, THE `/work` page SHALL display a message indicating no projects are available.
3. THE Public_Website SHALL provide no create, edit, update, or delete controls on any public-facing page or component.
4. WHEN a visitor navigates to `/work/[slug]`, THE Public_Website SHALL render the project detail page displaying the fields `title`, `category`, `shortDescription`, `image`, `client`, `timeline`, `results`, and `content` fetched from the Project_Store by matching the `slug` field.
5. IF no Project with the requested `slug` exists in the Project_Store, THEN THE Public_Website SHALL render a 404 Not Found page using Next.js `notFound()`.
6. IF a Project is written to the Project_Store and then read back by its `slug`, THEN the returned Project object SHALL have field values identical to those that were written (data round-trip integrity).
7. IF the Project_Store returns an error when the `/work` page fetches projects, THEN THE `/work` page SHALL display an error message indicating projects could not be loaded.

---

### Requirement 11: Admin Panel Separation and Layout

**User Story:** As the Root Nexus administrator, I want the admin panel to have its own isolated layout, so that it never inherits the public site's Navbar, Footer, or global components.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use a dedicated Next.js App Router layout file at `src/app/rn-secure-admin/layout.tsx` that does not include the `Navbar`, `Footer`, `FloatingActions`, or `AIAssistant` components.
2. WHEN the Admin_Dashboard renders, THE Admin_Panel layout SHALL include an admin header that renders the Root Nexus logo, a "Dashboard" label, and a logout button in the DOM (not hidden via CSS).
3. IF a route belongs to the Admin_Panel (`/rn-secure-admin/*`), THEN the root layout at `src/app/layout.tsx` SHALL NOT wrap that route with `FloatingActions` or `AIAssistant`.
4. THE Admin_Panel SHALL always render with the site's existing dark-mode color tokens regardless of the user's operating system color scheme preference.
5. WHEN the administrator activates the logout button in the Admin_Panel header, THE Admin_Panel SHALL invoke the logout Server Action and redirect the administrator to `/rn-secure-admin/login`.

---

### Requirement 12: Security Headers and Environment Configuration

**User Story:** As the Root Nexus administrator, I want the admin panel to be hardened against common web attacks, so that the single admin account and its session remain secure.

#### Acceptance Criteria

1. THE system SHALL require the following environment variables to be present at startup: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`; IF any are absent, THEN THE Project_Store initialization SHALL throw an error message identifying the missing variable by name and prevent the application from starting.
2. IF the `ADMIN_SESSION_SECRET` value decoded from base64 is fewer than 32 bytes, THEN THE system SHALL throw an error message stating the minimum required length and prevent the application from starting.
3. WHEN an IP address exceeds 10 login attempts within a fixed 15-minute window (starting from the first attempt in that window), THE Auth_Actions SHALL return an HTTP 429 response with a message indicating the cooldown period for every subsequent attempt within that window.
4. WHEN a response is sent for any route matching `/rn-secure-admin/*`, THE Admin_Panel SHALL include the following HTTP response headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`.
5. THE `ADMIN_PASSWORD_HASH` environment variable SHALL contain a bcrypt hash; IF the stored hash does not begin with `$2b$` or `$2a$`, THEN THE Project_Store initialization SHALL throw an error message indicating the invalid hash format and prevent the application from starting.
