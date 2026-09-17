# Teacher Dashboard evidence-capture playbook

Referenced by every change's blocking `0.x` capture tasks. Purpose: an
autonomous implementer must be able to resolve every BLOCKED-EVIDENCE
item without inventing environment or seeding steps. Planning artifact;
verify commands against the repo docs they cite before first use.

## 1. Environment startup

- Rails: `bin/dashboard-server` from the repo root (see repo `AGENTS.md`).
- Apps webpack dev server: `yarn start` from `apps/` (needed for legacy
  pages; `use_my_apps: true` + `rake package:apps:symlink` per
  `apps/README.md` if the symlink is stale).
- Frontend/Vite: `yarn dev` from `frontend/`.
- Canonical browser URL: `http://localhost-studio.code.org:9000` (webpack
  proxy in front of Rails). Captures of Rails JSON may also hit
  `http://localhost-studio.code.org:3000` directly.
- Serving-checkout validation BEFORE any capture: the Rails and apps dev
  server process cwd must point at this worktree (`ls -l /proc/<pid>/cwd`
  or `lsof -p <pid> | grep cwd`); abort and fix if not.

## 2. Seeding fixture sections

Use `dashboard/bin/rails runner` (non-destructive; creates new rows, never
edits existing users' data). The factories live in
`dashboard/test/factories/`; in the development environment prefer plain
AR creation mirroring what `SectionsController` does. Recipes (adapt
attribute names against the model, they are stable):

```ruby
# dashboard/: ./bin/rails runner - <<'RUBY'
teacher = User.find_by(email: 'capture-teacher@example.test') ||
  User.create!(user_type: 'teacher', email: 'capture-teacher@example.test',
               name: 'Capture Teacher', password: 'CapturePass1!',
               age: 30, terms_of_service_version: User::TERMS_OF_SERVICE_VERSIONS.last)

# One section per login type:
%w[word picture email].each do |lt|
  Section.create!(user: teacher, name: "cap-#{lt}", login_type: lt)
end
# Provider-managed sections need provider fields; copy the attribute set
# from an existing google_classroom/clever/lti_v1 section in the dev DB
# (SELECT via ./bin/mysql-client-dashboard-reader) or from the factories.

# Students (word section, N students for pagination captures):
sec = Section.find_by(name: 'cap-word')
45.times { |i| sec.add_student(User.create_young_student(name: "Cap Student #{i}", ...)) }
RUBY
```

Notes:
- The exact creation helpers for young students / followers change; read
  `dashboard/test/factories/users.rb` and `section.rb` before running —
  the playbook pins the APPROACH (rails runner + factory-mirroring), the
  model source pins the attributes.
- Archived section: set `hidden: true`. Co-taught: create a second
  teacher and an accepted `SectionInstructor`. PL: `participant_type`
  per `Pd::` conventions. Curriculum assignment: set
  `script`/`course_offering` via the same fields the settings save
  writes (recorded PATCH body is the reference).
- Age-gated / parental-permission states: locate the gating fields on
  `User`/`SectionStudent` from the age-gating Cucumber steps
  (`dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_*`)
  and set them directly.

## 3. Authenticated JSON capture

Two sanctioned methods:

1. Playwright (preferred; reuses the e2e auth helpers): a throwaway spec
   in `frontend/packages/e2e-tests` that signs in as the capture teacher
   (sign-in page flow with the seeded credentials), then
   `page.request.get('<endpoint>')` and writes
   `JSON.stringify(await resp.json(), null, 2)` to the fixture path.
   `page.request` shares the browser session cookies. For request-shape
   capture (headers, CSRF), use `page.on('request')` while driving the
   legacy UI action once.
2. curl with a session cookie: sign in via the browser, copy the
   `_learn_session*` cookie, `curl -H 'Cookie: ...' <url>`. Faster for
   one-offs; not scriptable across runs.

Fixture storage convention: recorded JSON lives next to its schema's
tests — `frontend/packages/core/src/api/dashboard/<domain>/__fixtures__/
<endpoint>.<scenario>.json` — committed, referenced by parser tests and
MSW defaults. Request-shape recordings (headers/bodies of writes) live in
the same dir as `<endpoint>.request.json`.

## 4. Flag pinning during capture

DCDO keys: set via the Cucumber-style cookie mock only in browser
scenarios; for Rails-side truth use `DCDO.set('<key>', <val>)` in rails
runner (development DCDO is local). Experiments: enable per-user via the
`experiments` framework's assignment table or the `?enableExperiments=`
query param the legacy `experiments.isEnabled` honors — confirm the
mechanism in `apps/src/util/experiments.js` before relying on it. Record
the pinned flag state in the fixture filename (`...podcast-dcdo-on.json`).

## 5. What NOT to do

- Never `./bin/mysql-client-dashboard-writer` without explicit human
  approval (repo rule).
- Never capture from production or test-studio for contract fixtures
  (shapes must match this checkout's code); staging-studio only for
  triangulating environment drift.
- Never hand-edit a recorded fixture to make a schema pass; re-record or
  fix the schema, and record the discrepancy.
