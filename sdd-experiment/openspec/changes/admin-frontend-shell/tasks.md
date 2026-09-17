# admin-frontend-shell tasks

## 1. Package scaffold

- [ ] 1.1 Generate frontend/packages/admin via the turbo generator
      (@code-dot-org/admin, app-shaped per packages/users template):
      standalone dev server, MSW ./mocks subpath, Vitest, lint-config
- [ ] 1.2 Default export AdminApp with internal routing for the landing
      page; DSCO components, CSS modules
- [ ] 1.3 Regenerate and commit frontend/yarn.lock

## 2. Studio mount

- [ ] 2.1 Add apps/studio/src/routes/admin routes: beforeLoad admin gate
      (redirect non-admin AuthOutcome), React.lazy import, Suspense
      fallback, errorComponent; regenerate routeTree.gen
- [ ] 2.2 Verify chunking: admin code absent from non-admin route chunks
      (vite build output inspection)

## 3. Landing page

- [ ] 3.1 Port the admin_reports#directory link inventory into the
      landing page: SPA links for ported tools (none yet), legacy
      /admin/... full-page links for the rest
- [ ] 3.2 Vitest: gate behavior (mock AuthOutcomes), landing renders all
      groups, legacy links are absolute paths

## 4. Verification

- [ ] 4.1 yarn typecheck + vitest in frontend/; ./tools/hooks/pre-commit
- [ ] 4.2 Manual: local dashboard + studio dev server — admin user sees
      the hub at /frontend-studio/admin, teacher gets redirected,
      standalone MSW dev server renders without Rails
