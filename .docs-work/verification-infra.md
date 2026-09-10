# Verification infrastructure

How to create accounts, sign in, seed data, run the existing suites, and what
blocks you. Claims are tagged STRONGLY SUPPORTED (code+test) / OBSERVED
(rails runner, mysql reader, curl) / INFERRED / AMBIGUOUS. Nothing in this
document was executed as a write; every probe under section 6 was run
read-only against the local dev server on 2026-09-09.

## 1. frontend/packages/e2e-tests (Playwright)

**STRONGLY SUPPORTED** (read directly): `README.md`, `package.json`,
`playwright.config.ts`, `tests/fixtures.ts`, `tests/shared/auth.ts`,
`tests/shared/api.ts`, `tests/shared/dcdo.ts`.

### Running it locally

```bash
# from frontend/, against the local dashboard, Chromium only:
yarn workspace @code-dot-org/e2e-tests test:ui:local
# equivalent, explicit:
TARGET_URL=http://localhost-studio.code.org:3000 yarn playwright test --project=chromium
# against any other deployment, all browsers:
TARGET_URL=https://my-adhoc.cdn-code.org yarn workspace @code-dot-org/e2e-tests test:ui
```

`playwright.config.ts`: `baseURL` defaults to `https://test-studio.code.org`,
overridden by `TARGET_URL`. No `webServer` block — the suite never starts its
own server, it only points at one. Chromium/Firefox/WebKit projects all run
unless `--project=` narrows; a `visual-*` project set exists only when
`VISUAL_PROVIDER` is set (Applitools/native-screenshot lane for `@visual`
tests). `grepInvert` excludes `@visual` from the three functional projects, and
additionally excludes `@no_ci` when `PLAYWRIGHT_PROVIDER=drone` (Drone's
freshly-built instance lacks backends like Javabuilder/LLM APIs). Retries are 2
under any automated provider (`github-actions`|`drone`|`dtt`), 0 locally.
`timeout: 90_000`, `expect.timeout: 15_000`.

### Fixtures (`tests/fixtures.ts`)

- `signInAsNewUser(options: CreateUserOptions) => Promise<UserCredentials>` —
  clears cookies, navigates to `/`, then calls `createUser`. This is the
  standard way a spec gets a fresh signed-in teacher/student.
- `dcdo.mock(key, value)` / `dcdo.clear()` — writes/removes the `DCDO` cookie
  read by Rack::CookieDCDO middleware, i.e. flips a feature flag for just this
  browser context. Must be called after the page has navigated once (cookie
  domain is derived from the current URL).
- Both are built on `@code-dot-org/playwright-support/visual`'s `createVisualTest`,
  which is also where the exported `test`/`expect` come from.

### Sign-in / user-creation mechanism (`tests/shared/auth.ts`, `tests/shared/api.ts`)

- `requestWithCsrf(page, method, path, body)` (api.ts) is the one shared
  transport: reads `<meta name="csrf-token">` from the currently-loaded
  document and does an in-page `fetch`. Every auth helper is built on this —
  the page must already be on the target host.
- `createUser(page, {type, name, ...})` — POSTs to `/api/test/create_user`
  (TestController#create_user, see §2), then POSTs `/users/sign_in` unless
  `signInAfterCreate:false`. Supports `sso: 'clever'|'google_oauth2'` (injects
  an `OmniAuth::AuthHash` server-side, no real OAuth handshake) and
  `omitCredentials` (teacher-managed/"sponsored" accounts with no
  email/password).
- `createStudent(page, opts)` — student-shaped sugar over `createUser`: age,
  US state (`usState`), `createdAt`, `parentCreated` (pre-populates the
  parent-permission email so the CAP lockout flow can be exercised),
  `sponsored` (implies `omitCredentials`+ no sign-in).
- `createEuStudent` — `createStudent` variant with
  `data_transfer_agreement_accepted` pre-set.
- `createTeacherAssociatedStudent({studentName, authorized?})` — creates a
  teacher, optionally POSTs `/api/test/enroll_in_plc_course` for "authorized
  teacher" status, POSTs `/dashboardapi/sections` (email login, student
  participant type) to get a `sectionCode`, creates the student, and POSTs
  `/join/:sectionCode` to enroll — full teacher+section+student+enrollment in
  one call, ending with the student's session active.
- `signIn(page, {email, password})` — POST `/users/sign_in`.
- `signOut(page)` — GET `/users/sign_out.json` (must return 204; DELETE 404s on
  test-studio), then clears `sessionStorage`/`localStorage`.
- `acceptParentalRequest(page)` — POST `/api/test/accept_parental_request`,
  using the currently-signed-in (student) session.
- `waitForHomeUrl(page, type)` — asserts exact pathname `/home` (student) or
  `/teacher_dashboard/home` (teacher).
- `resetSession(page)` — clears cookies.

### DCDO mocking (`tests/shared/dcdo.ts`)

Cookie-based, not server-side: `mockDcdo` reads the existing `DCDO` cookie
(JSON blob), merges in `{key: value}`, and re-sets the cookie on the derived
cookie domain (`shared/cookies.ts`'s `cookieDomain`). `clearDcdoCookie` removes
it. This only affects the browser context making the request — it does not
touch server-side `DCDO.get` for other clients (contrast with
`/api/test/get_dcdo`, §2, which reads the *server's* DCDO store and is a
different mechanism, used by `tests/dcdo-mocking/dcdo-mocking.spec.ts`).

### Tags / projects

- `@visual` — Applitools/native-screenshot lane; excluded from the three
  functional (chromium/firefox/webkit) projects.
- `@no_ci` — skipped under `PLAYWRIGHT_PROVIDER=drone` (Drone's build lacks
  some backends); mirrors Cucumber's `--ci` skip.
- `@no_safari` — seen inline in `tests/labs/weblab2.spec.ts` (a Safari-16 regex
  bug); grep didn't confirm a config-level wiring for it, so treat as
  **AMBIGUOUS** whether it's enforced outside that file's own logic — I only
  found it commented, not grepped project-wide.
- No config-level chromium-only tag scheme beyond the visual/no_ci ones above
  — **AMBIGUOUS**, the task prompt mentioned "chromium-only" as an example but
  I did not find an explicit `@chromium-only` tag in this package (that phrase
  appears in MEMORY.md for the Cucumber port work, a different suite).

### Spec files (one line each; **STRONGLY SUPPORTED** by filename + read describe
blocks/leading comments; full title lists not exhaustively enumerated per file)

- `activities/artist/artist.spec.ts` — Artist lab a11y regression baseline (axe).
- `activities/authored-hints.spec.ts` — authored-hints lightbulb/badge behavior.
- `activities/bee/bee.spec.ts` — Bee level 4 gameplay.
- `activities/block-layout.spec.ts` — block layout rendering.
- `activities/callouts.spec.ts` — in-level callout bubbles.
- `activities/contextual-hints.spec.ts` — contextual hints on incorrect solution.
- `activities/eyes.spec.ts` — visual (`@visual`) regression across labs.
- `activities/initial-page-views{,-2,-3}.spec.ts` — first-load smoke checks for
  several level/page types.
- `activities/maze/progress.spec.ts` — Maze progress-bubble color polling.
- `dcdo-mocking/dcdo-mocking.spec.ts` — verifies the DCDO cookie mock actually
  changes server-observed `DCDO.get` via `/api/test/get_dcdo`.
- `documentation/documentation-landing-page.spec.ts` — docs landing page a11y baseline.
- `foundations/create-dropdown.spec.ts` — "Create" menu dropdown a11y baseline.
- `foundations/i18n.spec.ts` — localization spot checks.
- `foundations/markdown-rendering.spec.ts` — markdown rendering across the site.
- `foundations/user-menu.spec.ts` — header user-menu a11y (known contrast defects).
- `gdpr/gdpr-dialog.spec.ts` — GDPR data-transfer-agreement dialog.
- `global-edition/fa/*.spec.ts` — Farsi MVP: personal-project-gallery, sign-in,
  sign-up pages under Global Edition.
- `global-edition/fa-teacher-dashboard.spec.ts` — Farsi teacher dashboard.
- `global-edition/region-select.spec.ts` — Global Edition region selector.
- `labs/sketch-lab.spec.ts` — Sketch lab palette/toolbar colors.
- `labs/weblab2.spec.ts` — Web Lab 2 (has `@no_safari` cases).
- `levels/map-level.spec.ts` — map-type level a11y baseline.
- `levels/multi{,2,3,4}.spec.ts` — multi-choice level playthroughs.
- `levels/standalone-video.spec.ts` — standalone video level progress polling.
- `manage-students/manage-students-tab.spec.ts` — CAP lockout date logic on
  Manage Students tab.
- `platform/cookie-banner.spec.ts` — cookie consent banner.
- `platform/header.spec.ts` — header navigation bar (incl. `ge_region` cookie).
- `platform/one-trust.spec.ts` — OneTrust consent SDK integration.
- `policy-compliance/lockout-phase.spec.ts` / `parental-permission.spec.ts` /
  `policy-compliance.spec.ts` — CAP (Colorado) lockout-date policy flows + a11y baseline.
- `projects/public-project-gallery.spec.ts` — public project gallery, signed out.
- `race-interstitial/race-interstitial.spec.ts` — race-data interstitial gating.
- `sign-in/login-redirect.spec.ts` — login-required redirect from a level page.
- `sign-in/signing-in.spec.ts` — sign-in flow.
- `smoke.spec.ts` — basic smoke test.
- `teacher-tools/teacher-dashboard/demo-section-card.spec.ts` — demo section
  card on teacher homepage.
- `teacher-tools/unnumbered-lessons.spec.ts` — unnumbered-lessons feature, a11y baseline.
- `video/fallback-player-caption-dialog-link.spec.ts` — caption-dialog link contrast.

`tests/pages/*.ts` and `tests/components/*.ts` are Page-Object-Model helpers
(not tests themselves); `tests/shared/*.ts` are the shared library (api, auth,
axe, colors, consent, cookies, dcdo, geolocation, i18n, progress, routes,
sections, stability, ui).

## 2. Test-only server APIs

**STRONGLY SUPPORTED**: `dashboard/app/controllers/test_controller.rb` (read in
full) and its route registration in `dashboard/config/routes.rb` (~line 1145).

### Environment guard

```ruby
# dashboard/config/routes.rb
if rack_env?(:development, :test)
  scope '/api' do
    namespace :test, defaults: {format: 'json'} do
      TestController.instance_methods(false).each do |action|
        method = action.to_s.start_with?('get') ? :get : :post
        send(method, action, action: action)
      end
    end
    post 'test/ai_proxy/assessment', to: 'test_ai_proxy#assessment'
  end
end
```

Every public instance method on `TestController` is auto-mounted at
`/api/test/<method_name>` (GET if the method name starts with `get`, else
POST). **This guard is `rack_env?(:development, :test)` — the local dev server
runs in `development`, so every one of these endpoints IS reachable at
http://localhost-studio.code.org:3000/api/test/... today.** (Separately,
`dashboard/app/controllers/dev_controller.rb` guards `start_build`/`check_dts`
with `rack_env?(:staging)`/forbidden-in-dev — that controller is CI/deploy
tooling, not account/data seeding, and is not reachable locally.)

### Endpoints (method inferred from name prefix; all under `/api/test/`)

| Endpoint | Purpose |
|---|---|
| `create_user` (POST) | Create + sign in a user from a permitted param whitelist; supports SSO provisioning via injected `OmniAuth::AuthHash` (no real handshake). This is what e2e-tests' `createUser` calls. |
| `accept_parental_request` (POST) | Grants the current user's pending `ParentalPermissionRequest` via `Services::ChildAccount.grant_permission_request!`. |
| `get_dcdo` (GET) | Returns both the request-scoped `DCDO.get` value and the underlying datastore-cache value for key `dcdo_mocking_test` — used to prove the DCDO cookie mock reached the server. |
| `levelbuilder_access`, `universal_instructor_access`, `authorized_teacher_access`, `plc_reviewer_access`, `facilitator_access`, `program_manager_access`, `workshop_admin_access` (POST) | Grant the current user a specific `UserPermission` and save. |
| `enroll_in_plc_course` (POST) | Enrolls current user in the `'UI Test PLC Things'` unit group's PLC course, all unit assignments set in-progress. |
| `fake_completion_assessment` (POST) | Enrolls the current user's PLC unit assignment in content+practice learning modules. |
| `create_student_section_assigned_to_course_and_unit` / `create_student_section_with_name` (POST) | Create a `Section` owned by current user, optionally tied to a course/unit. |
| `assign_course_and_unit_as_student` / `assign_course_as_student` (POST) | Create (or reuse, via `teacher_email`) a teacher, create a section, add current user as student, assign course/unit. |
| `assign_section_to_course_and_unit` (POST) | Point one of current teacher's existing sections at a course/unit and cascade `assign_script` to its students. |
| `get_i18n_t` (GET) | Render an i18n string server-side for a given key/locale. |
| `create_migrated_script` / `create_course` (POST) | Create throwaway `ui-test-`-prefixed script/course scaffolding (must live in that naming partition — see `dashboard/test/ui/config/README.md`). |
| `invalidate_script` / `destroy_script` / `destroy_course` / `destroy_level` (POST) | Cache-bust or hard-delete curriculum test fixtures. |
| `create_teacher_application` / `create_applications` / `delete_rp_pm_teacher_application` / `delete_workshop` | PD/teacher-application test fixtures. |
| `create_pilot`, `set_single_user_experiment`, `set_single_section_experiment` (POST) | Feature/experiment test fixtures. |
| `get_validate_rubric_ai_config` (GET) | Runs `AiRubricConfig.validate_ai_config`. |
| `complete_unit` (POST) | Marks a `UserScript` completed for the current user. |

## 3. Seeded data

**STRONGLY SUPPORTED**: `dashboard/db/seeds.rb` (empty template, unused —
`rake db:seed` does nothing meaningful here) and `dashboard/lib/tasks/seed.rake`
(616 lines, read in full).

`rake seed:default` runs whichever task list matches `CDO.rack_env`:

- `development` → `FULL_SEED_TASKS + UI_TEST_SEED_TASKS` (i.e. everything below,
  plus the UI-test-only tree) — **this is what a fresh dev DB is expected to
  have been seeded with.**
- `test` → `UI_TEST_SEED_TASKS` only.
- `adhoc` → `ADHOC_SEED_TASKS` (last-year-only curriculum subset, faster boot).
- else (staging/production) → `FULL_SEED_TASKS`.

`rake seed:all` = `FULL_SEED_TASKS`: `check_migrations, videos, concepts,
scripts (all config/scripts_json/**), json_videos, practice_problems, courses
(all config/courses/**), reference_guides, data_docs, jit_pl_concepts,
callouts, school_districts, schools, census_summaries, secret_words,
secret_pictures, foorms, datablock_storage, validate_ai_rubrics`.

Notable individual tasks:
- `seed:secret_words` / `seed:secret_pictures` — the two tasks TESTING.md calls
  out as required before first Dashboard test run (`SecretWord.setup`,
  `SecretPicture.setup`).
- `seed:single_script SCRIPT_NAME=...` / `seed:single_dsl DSL_FILENAME=...` —
  fast targeted reseed of one script/level file, for iterating on curriculum
  content without a full seed.
- `seed:sample_data` (`SampleData.seed`) and `seed:mega_section`
  (`MegaSection.seed`) — explicitly guarded to `adhoc`/`development` only
  (raises otherwise); these are the "give me realistic-looking sample
  users/sections" tasks, separate from curriculum seeding. I did not read
  `SampleData`/`MegaSection` themselves — **AMBIGUOUS** exactly what they
  populate; flagging as worth reading if the orchestrator wants bulk sample
  accounts rather than one-off factory/API-created ones.
- `seed:restricted_section` — creates one teacher + a `Section` + 500 student
  `User`s + `Follower`s, all literal `User.create`/`Section.create!` calls
  (read in full, see §4) — a working, if heavy, pattern for bulk section
  creation. **Not run** (write).
- `seed:import_users[file]` — bulk `User.create!` from a TSV.

Slow tasks (their own comments/names say so): `scripts`/`scripts_ui_tests`
(iterates all `config/scripts_json/**/*.script_json`, thousands of files),
`courses`, `ideal_solutions` (docstring: "very slow"), and by extension
`seed:all`/`seed:default` in `development` (both curriculum trees). No seed
task in this file was executed by me.

## 4. Local account creation — copy-pasteable commands

All VERIFIED-READ against `dashboard/test/factories/factories.rb` (2558 lines),
`dashboard/lib/tasks/seed.rake`, and `dashboard/app/controllers/test_controller.rb`.
FactoryBot is loaded in the `development` group
(`dashboard/Gemfile:141 gem 'factory_bot_rails', '~> 6.2', group: [:development, :staging, :test, :adhoc]`)
and confirmed live: `./bin/rails runner 'puts defined?(FactoryBot)'` → `constant` (OBSERVED).
None of the commands below were executed — read-only task.

Key factories (factories.rb line numbers): `:user`/`:student` (196, class
`Student`), `:teacher` (216, class `Teacher`), `:section` (817), `:follower`
(1642), `:unit`/`:script` (1191), plus many traits (`:admin`, `:levelbuilder`,
`:authorized_teacher`, `:young_student`, `:parent_managed_student`,
`:manual_username_password_student`, sections' `:hidden`/`:from_clever`/
`:teacher_participants`).

```bash
cd /var/home/sliang/git-workspaces/code-dot-org-full/dashboard

# --- Create a teacher (VERIFIED-READ: factories.rb:216-238) ---
./bin/rails runner 'FactoryBot.create(:teacher, email: "demo-teacher@test.xx", password: "demopassword", name: "Demo Teacher")'

# --- Create a teacher the plain-model way (VERIFIED-READ: test_controller.rb assign_course_as_student, seed.rake restricted_section) ---
./bin/rails runner 'User.create!(name: "Demo Teacher", email: "demo-teacher@test.xx", password: "demopassword", user_type: "teacher", age: "21+")'

# --- Create a student (VERIFIED-READ: factories.rb:383-390) ---
./bin/rails runner 'FactoryBot.create(:student, email: "demo-student@test.xx", password: "demopassword", name: "Demo Student")'

# --- Create a student the plain-model way (VERIFIED-READ: seed.rake restricted_section, lines ~ "Fake Section Cap Student") ---
./bin/rails runner 'User.create!(name: "Demo Student", email: "demo-student@test.xx", password: "demopassword", user_type: "student", age: "14")'

# --- Create a section owned by an existing teacher (VERIFIED-READ: factories.rb:817-836, seed.rake restricted_section) ---
./bin/rails runner 'teacher = User.find_by!(email: "demo-teacher@test.xx"); Section.create!(name: "Demo Section", user: teacher, login_type: "email", participant_type: "student")'

# --- Enroll a student in a section (VERIFIED-READ: factories.rb :follower 1642-1657, seed.rake restricted_section's Follower.create!) ---
./bin/rails runner 'section = Section.find_by!(name: "Demo Section"); student = User.find_by!(email: "demo-student@test.xx"); Follower.create!(section_id: section.id, student_user_id: student.id)'

# --- FactoryBot one-liner for teacher+section+enrolled-student together ---
./bin/rails runner 'section = FactoryBot.create(:section, user: FactoryBot.create(:teacher, email: "t@test.xx", password: "pw", name: "T")); FactoryBot.create(:follower, section: section, student_user: FactoryBot.create(:student, email: "s@test.xx", password: "pw", name: "S"))'
```

Sign-in is not something `rails runner` can do meaningfully (Devise's
`sign_in` needs a Warden-equipped controller/request context) — the verified
local mechanism is the same one e2e-tests uses (VERIFIED-READ:
`tests/shared/auth.ts` + `tests/shared/api.ts`, and it targets the same
`rack_env?(:development, :test)`-gated routes documented in §2):

```bash
# 1. Fetch the sign-in page to get a session cookie + CSRF meta tag:
curl -sS -c /tmp/cookies.txt http://localhost-studio.code.org:3000/users/sign_in -o /tmp/sign_in.html
TOKEN=$(grep -oP '(?<=name="csrf-token" content=")[^"]+' /tmp/sign_in.html)
# 2. POST credentials with that token and cookie jar:
curl -sS -b /tmp/cookies.txt -c /tmp/cookies.txt -X POST \
  -H "X-CSRF-Token: $TOKEN" -H "Content-Type: application/json" \
  -d '{"user":{"login":"demo-teacher@test.xx","password":"demopassword"}}' \
  http://localhost-studio.code.org:3000/users/sign_in
```

(This curl recipe is **INFERRED** from reading `shared/api.ts`/`shared/auth.ts`'s
in-browser equivalent — I did not execute it, since it would write a session /
count as a sign-in. The `/api/test/create_user` endpoint from §2 is the more
direct route: it both creates the user and signs them in server-side in one
call, no CSRF dance needed from an orchestrator's own script beyond what
`requestWithCsrf` already shows.)

## 5. Existing test suites — how to run them

Sourced from `TESTING.md`, `apps/README.md`, `frontend/AGENTS.md`,
`dashboard/test/ui/README.md`, and each package's `package.json`.

| Suite | Command | Docs' own claimed runtime |
|---|---|---|
| Apps (jest unit) | `cd apps && yarn test:unit` (single file: `yarn test:unit test/unit/gridUtilsTest.js`) | part of full `yarn test`, ~4-8 min |
| Apps (karma integration) | `cd apps && yarn test:integration` | part of full `yarn test`, ~4-8 min |
| Apps (all: lint+unit+integration) | `cd apps && yarn test` | "4-8 minutes" (TESTING.md); AGENTS.md says apps full suite "~5 minutes" |
| Apps lint | `cd apps && ./tools/hooks/pre-commit` (fast, changed files only) or `yarn lint` (repo AGENTS.md: "~a minute", full) |
| Apps typecheck | `cd apps && yarn run typecheck` | "~10s" (AGENTS.md) |
| Dashboard (Ruby/minitest, full) | `cd dashboard && RAILS_ENV=test bundle exec rails test` | "about 15 minutes" (TESTING.md) |
| Dashboard (single file) | `cd dashboard && bundle exec spring testunit ./path/to/test.rb` | fast, no claimed number |
| Dashboard (single test) | `cd dashboard && bundle exec spring testunit ./path/to/test.rb --name test_your_test_name` | fast |
| shared/ tests | `cd shared && bundle exec ruby -Itest ./test/path/to/your/test.rb` | no claimed number |
| lib/ tests | `cd lib && bundle exec ruby -Itest ./test/path/to/your/test.rb` | no claimed number |
| Pegasus (all) | `cd pegasus && rake test` | "~20 seconds" |
| Pegasus (one file) | `cd pegasus && rake test TEST=test/test_dev_routes.rb` | — |
| frontend/ (vitest, all packages) | `cd frontend && yarn test` | no claimed number; `yarn release:dryrun` runs build+lint+test before reporting success |
| frontend/ typecheck | `cd frontend && yarn typecheck` (turbo) | — |
| e2e-tests (Playwright, local) | `cd frontend && yarn workspace @code-dot-org/e2e-tests test:ui:local` | — |
| e2e-tests (Playwright, remote/all browsers) | `cd frontend && TARGET_URL=<host> yarn workspace @code-dot-org/e2e-tests test:ui` | Drone/DTT run both functional+eyes; DTT→GHA lane needs no CDO secrets |
| Cucumber UI tests (local chromedriver) | `cd dashboard/test/ui && ./runner.rb -l` (single feature: `rake test:ui feature=path/to/test.feature`) | full run "~45 minutes" against non-localhost target (README) |
| Cucumber Eyes tests | subset of the UI test suite tagged `@eyes`, run via the same runner | — |
| Top-level aggregate | `bundle exec rake test:all` / `rake test:changed` (detects changed sub-projects) | "running our whole test suite... can take quite a while" |
| Repo-wide lint (fast) | `./tools/hooks/pre-commit` from repo root | "usually very quick" |

Another agent owns `dashboard/test/ui/features/*` cataloging, per this task's
instructions — not enumerated here beyond the run commands above.

## 6. OBSERVED probes

All commands below were actually run against the live local server / local
mysql reader during this session.

**(a) Server reachability:**
```
/               -> 302
/courses        -> 301
/projects/public -> 200
/users/sign_in  -> 200
/home           -> 302
```
Server is up and routing (302s are expected redirects — `/` and `/home`
redirect when signed out, `/courses` is a legacy redirect route).

**(b) Row counts** (`./bin/mysql-client-dashboard-reader`):
```
users: 341   sections: 97   followers: 183   scripts: 1767   levels: 96464
```

**(c) `select user_type, count(*) from users group by user_type`:**
```
teacher: 139
student: 202
```
(No admin/other user_type rows appeared in the grouped result — only teacher
and student exist in this DB currently.)

**(d) Existing accounts** (`select id,email,user_type,name from users order by id limit 20`,
no password hashes):
first 20 rows are all `user_type=teacher`, ids 1-20, mixing three shapes:
Stephen's own manually-created test accounts (`stephen.liang+teacher1@code.org`
etc., id 1-3), factory/rake-seeded accounts with UUID or timestamp-suffixed
emails (`teacher_<uuid>@code.org`, `organizer<hex>@code.org`,
`facilitator<hex>@code.org`, `workshoporganizer_<uuid>@code.org`,
`user<timestamp>_<rand>@test.xx` — this last shape matches exactly what
`test_controller.rb`'s `assign_course_as_student`/`create_teacher_application`
and e2e-tests' `createUser` generate). This DB already carries prior local
testing residue — an orchestrator does not need to seed from empty, but should
not assume any particular row's password (all created programmatically, so
recreating a fresh one via §4/§2 is easy and cheap.)

## 7. Known blockers

- **None found for the primary account-creation path.** `/api/test/create_user`
  is reachable (guard is `rack_env?(:development, :test)`, dev server runs
  `development` — OBSERVED via `./bin/rails runner 'puts Rails.env'` →
  `development`), FactoryBot is loaded in dev (OBSERVED), and the DB already has
  341 users / 97 sections / 96464 levels, so curriculum seeding has clearly
  already run at some point.
- **`apps/` build/symlink**: `dashboard/public/blockly` is a live symlink to
  `apps/build/package`, and `locals.yml` has `use_my_apps: true` — both
  OBSERVED present, so this is not currently a blocker, but an orchestrator
  should be aware a `git checkout`/branch switch can silently revert the
  symlink target (per `apps/README.md`), which would need `rake
  package:apps:symlink` + a dashboard-server restart to fix.
  Cross-referenced in this user's own memory as
  `reference_fresh_worktree_asset_pipeline.md`.
- **SSO secrets (Clever/Google OAuth) are not configured for local dev** — grep
  of `config/development.yml.erb` found no `clever_id`/`google_oauth2_id`-style
  keys (AMBIGUOUS whether they live in an untracked `locals.yml` instead — I did
  not read `locals.yml` beyond the `use_my_apps` grep, since it may hold
  secrets). This does not block e2e-tests' SSO-flavored `createUser({sso:
  ...})` calls, though, since that path injects an `OmniAuth::AuthHash` directly
  server-side and never talks to the real provider (VERIFIED-READ:
  `test_controller.rb#create_user`).
- **LTI** — not investigated beyond noting `lti_*` factories exist
  (`lti_integration`, `lti_user_identity`, `lti_deployment`, `lti_course`,
  `lti_section`); whether a full LTI launch needs external secrets locally is
  **AMBIGUOUS**, out of scope for account creation/sign-in but worth flagging if
  the orchestrator's checks touch LTI-launched sections.
- **`seed:sample_data`/`seed:mega_section` internals unread** — flagged in §3 as
  AMBIGUOUS; if the orchestrator wants bulk realistic sample data rather than
  one-off accounts, read `SampleData`/`MegaSection` before invoking (both are
  writes, so I did not run or read the full class bodies here, only the rake
  task guard).
- **Test-only endpoints and `rails runner`/FactoryBot writes are equally live
  in the `test` Rails env** (test-studio.code.org) per the same route guard —
  worth noting so nobody assumes these are dev-only or somehow safe by
  environment alone; they are safe only because this is a disposable local/test
  DB, not because of any additional auth check.
