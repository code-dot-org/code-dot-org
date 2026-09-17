# admin-spa-shell

## ADDED Requirements

### Requirement: Admin package is lazy-loaded and admin-gated
The studio host SHALL serve admin UI only under /frontend-studio/admin/*
via a route whose beforeLoad rejects any AuthOutcome other than signed-in
with user_type admin, and whose component is a React.lazy import of
@code-dot-org/admin so the admin bundle is a separate chunk.

#### Scenario: Non-admin navigates to /frontend-studio/admin
- **WHEN** a signed-in teacher or student (or signed-out visitor) loads
  an admin route
- **THEN** they are redirected away before any admin component renders
  and the admin chunk is not fetched

#### Scenario: Admin navigates to /frontend-studio/admin
- **WHEN** a signed-in admin loads an admin route
- **THEN** the admin chunk loads (Suspense fallback while fetching) and
  the admin app renders

#### Scenario: Student session bundle hygiene
- **WHEN** a student uses any non-admin studio route
- **THEN** no admin package code is present in the JavaScript they
  download

### Requirement: Admin package is developable standalone
The @code-dot-org/admin package SHALL run under its own dev server with
MSW fixtures (./mocks subpath) so admin pages can be developed and
Vitest-tested without a Rails backend.

#### Scenario: Standalone dev
- **WHEN** a developer starts the package dev server with MSW enabled
- **THEN** the admin app renders with fixture data and no requests reach
  a real backend
