# 12 — New engineer: run the app locally and create a test student

**Verdict: HELPED**

## Path taken
- CodeAI Documentation (home) — start
- Developers (landing page) — 1 click
- Local development — 2 clicks (answered "run the app")
- Test API and local accounts — 3 clicks (answered "create a test student")

## Answering sentence
- "From the repo root, run bin/dashboard-server. This starts Puma on http://localhost-studio.code.org:3000."
- "From apps/, run yarn start. This starts the webpack dev server on http://localhost:9000, proxying to Rails."
- Rails runner example: `./bin/rails runner 'FactoryBot.create(:student, email: "s@test.xx", password: "pw", name: "S")'`

## Confusion points
- Test HTTP API table lists endpoints (e.g., /api/test/create_user) but never shows a curl example or JSON body shape. What type values are valid? Are name/email/password required? Expected a copy-pasteable curl command like the rails runner section got.
- Playwright createUser helper section says "The page must already be on the target host" — only makes sense inside a .spec.ts test file, not obvious this does not apply to a first-week engineer browsing around.
- API table says routes are POST but does not say what happens if someone navigates to the URL in a browser (GET). A junior engineer would try to visit the URL.

## Screenshots
None on either page. Missing: a screenshot of successful bin/dashboard-server startup log, and a screenshot of the sign-in page after using rails-runner-created student credentials.

## Product test
Navigated to http://localhost-studio.code.org:3000/ — loaded, redirected to teacher_dashboard/home (already signed in from a prior session). Confirms the documented URL and port are correct. Could not verify student-account creation (requires terminal command).

## Three wishes
1. "Give one worked curl example for the HTTP API, with headers and body."
2. "Say explicitly which mechanism to use when clicking around locally (rails runner) vs writing an automated test (createUser/HTTP API)."
3. "Show a screenshot of a signed-in student session after using the rails-runner account."
