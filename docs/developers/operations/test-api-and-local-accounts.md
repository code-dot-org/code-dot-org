---
title: Test API and local accounts
description: The test-only HTTP API, the e2e createUser helper, rails runner account creation, and the test_logs exception.
type: reference
---

**Applies to:** development and test environments only (except `test_logs`, which is reachable everywhere).

Three mechanisms create throwaway accounts for local testing: the test-only HTTP API, the Playwright `createUser` helper, and `rails runner` with FactoryBot.

## Which mechanism to use

| Situation | Mechanism |
|---|---|
| Clicking around locally in the browser | `rails runner` with FactoryBot -- creates the account in the database, then sign in through the browser. |
| Writing or running a Playwright test | `createUser` or `signInAsNewUser` helper -- creates and signs in within the test's browser context. |
| Scripting from outside the app (curl, Postman, CI) | Test HTTP API at `/api/test/create_user` -- no session needed. |

## Test-only HTTP API

`TestController` auto-mounts every public instance method at `/api/test/<method_name>`. Methods starting with `get` are mounted as GET; all others as POST. The route block is guarded by `rack_env?(:development, :test)` in `dashboard/config/routes.rb`, so these endpoints exist only when `Rails.env` is `development` or `test`.

The controller carries no per-action authentication. Any HTTP client that can reach the server can call any endpoint.

### Key endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/test/create_user` | POST | Create a user and sign them in. Supports SSO provisioning via injected `OmniAuth::AuthHash` (no real OAuth handshake). |
| `/api/test/accept_parental_request` | POST | Grant the current user's pending parental permission request. |
| `/api/test/levelbuilder_access` | POST | Grant the current user the LEVELBUILDER permission. |
| `/api/test/authorized_teacher_access` | POST | Grant AUTHORIZED_TEACHER. |
| `/api/test/universal_instructor_access` | POST | Grant UNIVERSAL_INSTRUCTOR. |
| `/api/test/facilitator_access` | POST | Grant FACILITATOR. |
| `/api/test/plc_reviewer_access` | POST | Grant PLC_REVIEWER. |
| `/api/test/program_manager_access` | POST | Grant PROGRAM_MANAGER. |
| `/api/test/workshop_admin_access` | POST | Grant WORKSHOP_ADMIN. |
| `/api/test/enroll_in_plc_course` | POST | Enroll the current user in a PLC course. |
| `/api/test/create_student_section_assigned_to_course_and_unit` | POST | Create a section tied to a course and unit. |
| `/api/test/set_single_user_experiment` | POST | Set an experiment for a single user. |
| `/api/test/set_single_section_experiment` | POST | Set an experiment for a section. |
| `/api/test/create_pilot` | POST | Create a pilot. |
| `/api/test/get_dcdo` | GET | Return both the request-scoped and datastore-cache values for a DCDO key. |
| `/api/test/get_i18n_t` | GET | Render an i18n string server-side. |
| `/api/test/create_migrated_script` | POST | Create a throwaway `ui-test-`-prefixed curriculum script. |

The full list is every public method on `dashboard/app/controllers/test_controller.rb`.

### Example: create a teacher with curl

```sh
curl -X POST http://localhost-studio.code.org:3000/api/test/create_user \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'user_type=teacher&name=Demo+Teacher&email=demo-teacher@test.xx&password=testpassword1'
```

The response sets a session cookie. To create a student, change `user_type=student`. The `name`, `email`, and `password` fields are required for email-based accounts. To create a teacher-managed student (no email, no password), omit `email` and `password` and pass `user_type=student`.

## Playwright `createUser` helper

The e2e test suite (`frontend/packages/e2e-tests/`) wraps the test API in TypeScript helpers at `tests/shared/auth.ts` and `tests/shared/api.ts`.

`createUser(page, {type, name, ...})` POSTs to `/api/test/create_user`, then POSTs `/users/sign_in` to establish a session. It supports `sso: 'clever' | 'google_oauth2'` (server-side OmniAuth injection, no real handshake) and `omitCredentials` (teacher-managed accounts with no email or password).

Higher-level helpers:

- `signInAsNewUser(options)` -- clears cookies, navigates to `/`, then calls `createUser`. This is the standard way a spec gets a fresh signed-in user.
- `createTeacherAssociatedStudent({studentName, authorized?})` -- creates a teacher, a section, a student, and enrolls the student, ending with the student signed in.
- `dcdo.mock(key, value)` -- sets the `DCDO` cookie so the server reads the mocked value for this browser context only.

Every helper calls `requestWithCsrf(page, method, path, body)`, which reads the CSRF token from the current page's `<meta name="csrf-token">` and does an in-page `fetch`. The page must already be on the target host before any helper is called.

## `rails runner` and FactoryBot

FactoryBot is loaded in the development environment. From `dashboard/`:

```sh
# Create a teacher:
./bin/rails runner 'FactoryBot.create(:teacher, email: "t@test.xx", password: "pw", name: "T")'

# Create a student:
./bin/rails runner 'FactoryBot.create(:student, email: "s@test.xx", password: "pw", name: "S")'

# Create a section and enroll a student:
./bin/rails runner '
section = FactoryBot.create(:section, user: User.find_by!(email: "t@test.xx"))
FactoryBot.create(:follower, section: section, student_user: User.find_by!(email: "s@test.xx"))
'
```

Useful factory traits: `:admin`, `:levelbuilder`, `:authorized_teacher`, `:young_student`, `:parent_managed_student`. See `dashboard/test/factories/factories.rb` for the full list.

You can also create users without FactoryBot:

```sh
./bin/rails runner 'User.create!(name: "Demo", email: "demo@test.xx", password: "pw", user_type: "teacher", age: "21+")'
```

## The `test_logs` exception

`Api::V1::TestLogsController` serves Cucumber test-run status pages. It reads S3 objects from the `cucumber-logs` bucket and renders them as JSON.

Unlike the test-only API, this controller is **not** inside the `rack_env?(:development, :test)` guard. Its routes are registered unconditionally inside `namespace :api do namespace :v1 do` in `routes.rb`, which means it is reachable in every environment, including production. The controller performs no authentication check.

The practical impact is limited: the endpoints read from an S3 bucket (`cucumber-logs`) that only the CI infrastructure writes to, and the data is test-run metadata, not user data. But any engineer extending this controller or adding similar test-support routes should be aware that the environment guard does not cover it.

## Next steps

- [Testing](/developers/operations/testing/) -- the full suite reference.
- [Local development](/developers/operations/local-development/) -- running the servers these accounts connect to.
