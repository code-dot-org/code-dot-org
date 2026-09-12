# admin-pilots tasks

## 1. API

- [ ] 1.1 Api::Admin pilots controller: index, create, show,
      users#create (email list, per-email outcomes), users#destroy;
      audit enrichment with pilot name + affected_user_id
- [ ] 1.2 Controller tests: CRUD, partial enrollment outcomes,
      URL-encoded pilot names, non-admin 403, audit rows

## 2. SPA pages

- [ ] 2.1 Pilots list + detail pages in packages/admin; shared
      email-list outcome component from admin-permissions; MSW + Vitest
- [ ] 2.2 Flip landing-page link

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual: create pilot, enroll seeded teacher + bogus email,
      remove, inspect audit rows
