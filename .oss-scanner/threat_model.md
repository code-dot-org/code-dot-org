# Threat model: code-dot-org

This file tells the OSS Scanner what this repository is, which boundaries
matter, and how we rate what crosses them.

## What this is

The monorepo behind Code.org's learning platform, Studio (studio.code.org,
called "dashboard" internally), and code.org. Most users are K-12 students,
many under 13, and their teachers. School districts provision accounts through
SSO, LTI and rostering services.

| Path | Contents |
|---|---|
| `dashboard/` | The Rails application: accounts, sections, curriculum, project storage, JSON APIs, staff and Level Builder tools. `dashboard/legacy/middleware/` holds the Sinatra project-storage APIs mounted in Rails; `dashboard/engines/` holds Rails engines. |
| `lib/`, `shared/` | Ruby libraries used by dashboard: configuration (`CDO`), dynamic config (DCDO), database, S3, secrets, project storage, middleware. |
| `apps/src/`, `frontend/` | Client JavaScript and TypeScript: the student labs, the lab2 runtime, Blockly integration, teacher dashboards, the design system. |
| `python/` | Python Lab support code that runs in the browser under Pyodide. |
| `aws/`, `cookbooks/`, `k8s/`, `docker/`, `.github/`, `.drone.yml`, `bin/`, `tools/` | Infrastructure as code, Chef cookbooks, CI and deployment. |
| `pegasus/` | The retired marketing site; only migrations, cache and rake tasks remain. |

Many labs share code: the lab2 runtime (`apps/src/lab2`), the Blockly
integration (`apps/src/blockly`), the Code Studio shell
(`apps/src/code-studio`) and the design system
(`frontend/packages/component-library*`). A finding there usually affects
every lab that uses it; say which ones are reachable.

## Starting positions

An attacker starts from one of these. They are not equivalent; state which one
a finding assumes.

1. **Anonymous visitor.** Any public route, share page, or anonymous API.
2. **Signed-in student.** Includes students under 13 whose accounts a teacher
   manages and who sign in with a picture or word password.
3. **Signed-in teacher.** Owns sections and can see and manage their students.
4. **Author of shared content.** Any user whose project, data block, chat
   message or other content is later rendered or run for another user.
5. **Identity provider or LMS input.** OAuth callbacks (Google, Microsoft,
   Facebook, Clever, ClassLink), LTI 1.3 launches and roster sync.
6. **Scoped staff author.** A Level Builder or content author. Authors are
   trusted to write curriculum, not to run code on the server or to publish
   outside their content.
7. **Pull-request contributor.** Code that CI runs before review.

## Untrusted input and where it enters

- Every HTTP request to dashboard: `dashboard/config/routes.rb`,
  `dashboard/app/controllers/` (including `api/v1/**`), and the legacy
  middleware under `dashboard/legacy/middleware/`.
- Student projects: sources, assets, files, animations and libraries through
  `/v3/*` (`files_api.rb`, `channels_api.rb`). They are rendered back to the
  author, to teachers reviewing work, to anyone with a share link, and in the
  public gallery.
- Student code that runs. App Lab, Game Lab, Sprite Lab and the puzzle labs
  run it in interpreters in the browser. Python Lab runs it in a Pyodide
  worker. Web Lab serves student HTML from the codeprojects domains. Java Lab
  sends it to the Javabuilder service.
- Data blocks (`datablock_storage_controller.rb`), some of them reachable
  without signing in.
- Identity and rostering: `omniauth_callbacks_controller.rb`,
  `dashboard/config/initializers/devise.rb`, `lti_v1_controller.rb` and
  `dashboard/app/controllers/lti/v1/`, and Clever, ClassLink and LTI roster
  sync.
- Outbound fetches on a user's behalf: `xhr_proxy_controller.rb`,
  `media_proxy_controller.rb`, `curriculum_proxy_controller.rb`,
  `redirect_proxy_controller.rb`, `/v3/images/moderate_url`, and Python Lab's
  `requests` shim, which goes through the XHR proxy.
- AI features: student text goes to model providers, and model output is
  rendered to students and teachers.
- Teacher content rendered to students: section names, rosters, feedback,
  rubric comments.
- Level Builder input: level, script and course definitions, authored DSL
  files, and anything that becomes a generated file or a commit.
- CI inputs: pull-request code run by GitHub Actions (`.github/workflows/`)
  and Drone (`.drone.yml`).

## What we are protecting

In priority order:

1. **Student and teacher data.** Personal data (`users`: names, emails,
   parent email, birthday, sign-in IPs; `user_geos`; parental permission
   requests; OAuth tokens), project contents, AI chat logs and data-block
   storage. COPPA, FERPA and state student-privacy laws apply.
2. **The boundaries between users.** A student sees only their own work and
   work shared with them. A teacher sees and manages only students in their own
   sections. Staff roles (`users.admin`, `UserPermission`) are granted only on
   the server. Authorization is in `dashboard/app/models/ability.rb` (CanCanCan)
   and `dashboard/lib/policies/`.
3. **Sessions and accounts.** The `_learn_session` cookie and Redis session
   store; Devise sign-in, password reset and confirmation; OAuth and LTI
   account linking; account transfer and takeover flows; admin impersonation
   (`admin_users_controller#assume_identity`).
4. **Isolation of learner code.** Learner code must not act with another
   user's session, or with a server or executor's authority. Code that runs on
   the Studio origin, Python Lab's worker among it, is the most sensitive case.
   Web Lab and the preview domains exist to keep student pages off that origin.
5. **The server and its cloud authority.** Code execution on an application
   host, server-side file read, or SSRF reaches credentials and cloud
   permissions. The impact goes well beyond that one request.
6. **The integrity of what we ship.** The source, curriculum, cookbooks,
   build artifacts and deployment state that become production.
7. **Tokens we sign.** Javabuilder and AI-gateway JWTs, LTI tokens, and the
   JWKS at `/oauth/jwks`.

## In scope

- Everything under `dashboard/`, `lib/`, `shared/`, `apps/src/`, `frontend/`
  and `python/`.
- CI definitions (`.github/workflows/`, `.drone.yml`) and infrastructure code
  (`aws/`, `cookbooks/`, `k8s/`, `docker/`), but only for a concrete path from
  one of the starting positions above to credentials, production artifacts or
  deployment. Breadth of cloud IAM, deployment-pipeline design and backup are
  already tracked internally. Do not report them as standalone configuration
  findings.

## Out of scope

- Vendored third-party code: `apps/lib/**` (Blockly, Ace, Droplet, Phaser,
  Pyodide, jQuery UI, ...), minified bundles in `apps/static/` and
  `dashboard/public/`, the generated Clever client in `dashboard/lib/clever`,
  `node_modules/` and gems. Report one only if our code makes it reachable,
  and report it against our use.
- Dependency versions in lockfiles without a demonstrated path through our
  code.
- Tests, fixtures, VCR cassettes, storybook, `frontend/packages/e2e-tests`,
  `frontend/packages/playwright-support`, `experimental/`.
- `dev_controller.rb` and `test_ai_proxy_controller.rb`, unless they are
  reachable in production. Check how they are gated.
- `pegasus/`.
- The separate repositories: Javabuilder, the AI gateway, and the
  infrastructure repository.

## How to exercise it (inside this image, offline)

The image is built by `.oss-scanner/Dockerfile`. Everything below was verified with no network on a 2 CPU / 8 GB container, as root from `/src`, with `RAILS_ENV=test` (already set). No secrets are needed: `config/test.yml.erb` stubs them all.

**What is installed:**

- Ruby 3.3.12 (from `.ruby-version`) with every Gemfile group.
- Node 20 with yarn 4: `apps/` and `frontend/` dependencies installed, and the `frontend/packages` that `apps/` consumes already built.
- The uv venv, Python 3.12 with the dev group.
- MySQL 8.0 and Redis, with:
  - `dashboard_test`, for the tests, prepared the way CI prepares it (schema + test fixtures + `seed:test`)
  - `dashboard_test_app`, for running the app, prepared the same way and then seeded with a subset of curriculum: `seed:ui_test` (the UI-test units CI uses) and the AI Foundations course `ai-foundations-exploring-ai-and-cs-2026` (8 units, one of them Python Lab), plus the demo accounts below
  - `pegasus_test` migrated
- An S3 emulator (moto) on `127.0.0.1:9000`, which `locals.yml` points the app at, so project code, files and assets save and load. It keeps data in memory, so saved projects last until it stops.
- The frontend, built as for CI's UI tests: the minified `apps/` webpack bundles (`apps/build/package`, served through `dashboard/public/blockly`), the Studio app (`frontend/apps/studio/dist`), and the Rails assets precompiled into `dashboard/public/assets`.
- All Git LFS content (locales, lab JSON and media under `apps/static`, images, test fixtures).
- Headless Chrome: Chrome for Testing at `/usr/local/bin/chrome` (`CHROME_BIN`), the build the pinned Playwright expects, so Playwright finds it without `playwright install`. In this container run it with `--no-sandbox --disable-dev-shm-usage`.

**Start the services first.** This takes about 1s, because the data is already in the image. Rails needs MySQL even to boot.

```bash
/src/.oss-scanner/start-services.sh            # MySQL 8 (socket + 127.0.0.1:3306; Rails uses `writer`/`reader`, admin is root; no passwords) + Redis + S3 emulator
/src/.oss-scanner/start-services.sh --reset    # drop and re-prepare the test DBs (~2 min); discards the curriculum and demo accounts
```

**Toolchain:**

```bash
bundle exec ruby -e 'puts :ok'
uv run --no-sync python -c 'import neighborhood'
node --version                                       # v20.x
(cd apps && yarn --version) && (cd frontend && yarn --version)
cd dashboard && bundle exec rails runner 'p User.count'   # Rails console/runner against dashboard_test
```

**Ruby tests** (minitest; one file takes ~1-4 min on 2 CPUs):

```bash
cd /src/dashboard && bundle exec rails test test/models/ability_test.rb
cd /src/dashboard && bundle exec rails test test/controllers/api/v1/sections_students_controller_test.rb
cd /src/dashboard && bundle exec rails test test/models/user_test.rb
cd /src/dashboard && bundle exec rails test test/controllers/some_controller_test.rb -n /name_regex/
cd /src/dashboard/legacy && bundle exec ruby -Itest test/middleware/test_channels.rb   # project storage APIs
cd /src/lib && bundle exec ruby -Itest test/test_cdo.rb
```

**JS tests:**

```bash
cd /src/apps && yarn jest --maxWorkers=2 test/unit/<file-or-dir>     # Jest (apps/)
cd /src/frontend/packages/component-library && yarn test              # Vitest (frontend/ packages)
```

**Python tests:**

```bash
cd /src && for d in python/pythonlab/*/; do uv run --no-sync pytest -q "$d"; done   # one package at a time, as CI does
```

**Demo accounts and curriculum.** They are in `dashboard_test_app`, so start the server with `TEST_ENV_NUMBER=_app`:

```bash
cd /src/dashboard && TEST_ENV_NUMBER=_app bundle exec rails s -p 3000 -b 127.0.0.1
```

Then sign in at `http://127.0.0.1:3000/users/sign_in`, password `demo-password-1` for both:

- `demo-teacher@example.com`: a teacher with "Demo Section", assigned the AI Foundations course
- `demo-student@example.com`: a student in that section; sign-in lands on the course

The Python Lab unit is `/courses/ai-foundations-exploring-ai-and-cs-2026/units/6`; its first Python Lab level is lesson 4, level 1. Verified as the student: open a level, edit and run Python (it runs in the browser), reload and find the code saved, with progress recorded. Projects work too: `/projects/pythonlab/new` creates, runs and saves one. Use `127.0.0.1:3000`, which `locals.yml` names as the studio host, so generated links and cookies stay on this server; `localhost` is a different origin.

**Writing a reproducer.** A dashboard test is the best form: a controller or integration test under `dashboard/test/` using the factories in `dashboard/test/factories/`. Tests should create the units, lessons and levels they need with factories, as the existing tests do, rather than depend on the seeded curriculum. `rails server` also works: `cd dashboard && bundle exec rails s -p 3000 -b 127.0.0.1` after `start-services.sh`, about 15s to boot. Verified: `/users/sign_in` 200 in under a second, `/` 302. In headless Chrome (Playwright from `frontend/`, launched with `--no-sandbox --disable-dev-shm-usage`), `/users/sign_in`, `/users/sign_up`, `/home` and `/projects/public` load in about 4s with their webpack bundles running and no page errors; only requests to external hosts (fonts, analytics, OneTrust) fail. Pages for curriculum that is not seeded, or that need an external service, will error.

**What does not work offline in this image:**

- **No `yarn install`, `bundle install` or `uv sync` that needs new packages.** The yarn download caches were removed to save space; installed `node_modules` work.
- **No rebuilding the served frontend.** An edit under `apps/src` does not change what Rails serves; `yarn build:dist` needs more memory than this machine has. Jest reads the source, so test client code there.
- **AWS other than S3 (Secrets Manager, CloudFront signed cookies), Javabuilder, AI/LLM providers, Clever/Google/Microsoft OAuth and other external services are unreachable.** Code paths that call them fail or use test doubles. So do lab assets loaded from other hosts: Music Lab's sound library (`curriculum.code.org`), Dance Party's songs, and the Sprite Lab/Game Lab animation library, which nothing seeds into the emulated bucket.
- **Cucumber/Selenium UI tests** are not set up: there is no chromedriver.

## How we rate severity

Rate by what the attacker ends up controlling. "XSS" or "SQLi" alone does not
set a severity. A finding that hands an attacker a different principal is
worth more than one that stays inside the attacker's own account.

- **Critical**
  - Code execution on an application server. This reaches host credentials
    and the host's cloud permissions, not just the request.
  - Server-side read of arbitrary files. Readable credentials are assumed
    exposed.
  - SSRF that reaches cloud metadata or internal services.
  - SQL injection, or authentication or authorization bypass, that exposes
    or changes many users' data without a victim action.
  - Session or account forgery.
  - A path from a pull request, a Level Builder author or a student into
    production artifacts, deployment, or CI credentials.
- **High**
  - Crossing the student/teacher/section boundary for one victim or class.
    For example, a teacher reads another teacher's students, or a student
    reads another student's private project or personal data.
  - Account takeover that needs one victim action.
  - Stored XSS, or a learner-code escape, that runs on the Studio origin as
    another user. One that spreads through normal sharing, teacher review or
    the gallery may be Critical; say why.
  - Post-authentication SQL injection.
  - Privilege escalation to teacher, staff, Level Builder or admin.
  - A Level Builder author executing code on the host or writing files
    outside their content.
  - Forging a token we sign.
- **Medium**
  - Reflected XSS.
  - CSRF on a state-changing action with real effect. About 30 actions skip
    Rails CSRF protection; check whether each exemption is safe.
  - SSRF limited to external hosts.
  - A bypass of the child-account or parental-consent policy
    (`dashboard/lib/policies/child_account*`) that exposes no data.
  - Leaks of internal, non-personal data.
- **Low**
  - Issues that need staff privileges to exploit.
  - Missing hardening headers.
  - Open redirects with nothing chained.
  - Self-XSS.
  - Gaps in rate limiting.
- **Denial of service** is Low. It is Medium when one unauthenticated request
  degrades a shared service, such as through a pathological regular
  expression, an unbounded query, or spending a shared AI-provider budget.

Raise the severity one level when a finding exposes the personal data of
students under 13.

When you rate:

- Name the principal reached: the viewer's browser session, a teacher, the
  application host, the Javabuilder executor, or CI. A browser escape on the
  Studio origin and a backend executor escape reach different principals; do
  not count one as both.
- Separate what the source shows from what you executed. Say which steps of a
  chain you demonstrated in this image and which you inferred.
- State the starting position and any preconditions, such as a victim click,
  a shared project, or a teacher reviewing work.

## Report and patch preferences

- **One report per root cause.** When the same missing check appears in
  several actions of one controller, file one report and list the affected
  actions.
- **Reproducer.** Prefer a failing test under `dashboard/test/` (minitest,
  using the factories), or a short sequence of requests or `rails runner`
  commands that runs in this image. Never use real student data.
- **Patch.** A minimal patch with a regression test where practical. It need
  not be merge-ready.

## Do not report

- Student code running in the student's own browser. That is the purpose of
  the labs. Report it only when it runs with another user's session, escapes
  the codeprojects or preview isolation, or is trusted by a `postMessage`
  handler on the Studio origin.
- Public share links being public.
- Clever and ClassLink setting `provider_ignores_state`. That is how flows
  started by those identity providers work. Report only a concrete exploit.
- The stub secrets in `config/test.yml.erb`, `config/secrets.yml.template`,
  `shared/test/fixtures/`, `docker/rails/adhoc.env` and
  `docker/developers/.env`. They are fake by design.
- Anything that fails only because this image has no network: AWS, S3,
  Secrets Manager, Javabuilder, AI providers, OAuth providers.
- Facts that need deployed state this image cannot show: AWS policies, WAF
  rules, network groups, Chef server state. Cite the code and say what would
  need to be checked in production.
