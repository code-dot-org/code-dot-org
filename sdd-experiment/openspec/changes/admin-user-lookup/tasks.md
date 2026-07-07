# admin-user-lookup tasks

## 1. Query extraction

- [ ] 1.1 Extract Admin::StudentSearch and Admin::SectionLookup (and a
      user-inspector query object) from admin_search_controller /
      admin_users_controller actions; legacy actions call them
- [ ] 1.2 Parity tests: legacy action and query object return equivalent
      result sets for fixture users/sections (incl. deleted)

## 2. API endpoints

- [ ] 2.1 Api::Admin controllers for search, section lookup, user
      inspectors (progress/projects/sections); read replica where the
      legacy actions use it
- [ ] 2.2 Controller tests: identifier forms, deleted flags, empty-set
      200, unknown-user 404, non-admin 403, no audit rows on GET

## 3. Client + SPA pages

- [ ] 3.1 Zod schemata + query modules for the new endpoints (location
      per current core client conventions)
- [ ] 3.2 Search, section-lookup, and inspector pages in
      packages/admin with cross-links; MSW fixtures
- [ ] 3.3 Vitest for pages; landing-page links flipped from legacy to
      SPA for these tools

## 4. Verification

- [ ] 4.1 spring testunit new/changed Ruby tests; yarn typecheck +
      vitest; ./tools/hooks/pre-commit
- [ ] 4.2 Manual: side-by-side legacy vs SPA results for a seeded
      student, a deleted section, and an unknown email
