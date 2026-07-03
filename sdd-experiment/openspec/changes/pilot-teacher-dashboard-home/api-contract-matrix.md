# API Contract Matrix — pilot-teacher-dashboard-home

The candidate route uses exactly ONE API: `GET /api/v1/sections`. No other
endpoint is consumed (no mutation, no per-section fetch — the read-only cards
read the list payload directly, as the legacy home does).

## GET /api/v1/sections

- **Method + path:** `GET /api/v1/sections` (also mounted at
  `/dashboardapi/sections`).
- **Auth:** Devise session cookie; CanCanCan `can :index, Section` is granted
  only to persisted (signed-in) users. No `authenticate_user!` on the JSON path
  (that fires only for HTML format).
- **Request params:** none. Returns the caller's instructed sections
  (`current_user.sections_instructed`).
- **Response envelope:** none — a bare JSON array of section objects, HTTP 200.
- **Source of truth (Rails):**
  - `dashboard/app/controllers/api/v1/sections_controller.rb:21-26` (`index` →
    `current_user.sections_instructed.map(&:summarize_without_students)`).
  - `dashboard/app/controllers/api/v1/json_api_controller.rb` (base; rescues
    `CanCan::AccessDenied` → `head :forbidden`).
  - `dashboard/app/models/sections/section.rb`:
    `summarize_without_students` (531-533) → `summarize` (633-717) →
    `summarize_for_participant` (720-765).
  - `dashboard/app/models/ability.rb:177` (`can :index, Section` inside
    `if user.persisted?`).
  - Route: `dashboard/config/routes.rb:204-205`.

### Full observed response schema (per array element)

`summarize_without_students` = `summarize(include_students: false)`, i.e. the
`summarize` union with `students: nil`. Every element is a flat object with the
union of `summarize_for_participant` (base) and `summarize` (merged) keys:

| key | type | nullable | consumed by pilot |
|---|---|---|---|
| `id` | integer | no | YES |
| `name` | string | yes | YES |
| `code` | string | yes (null for demo) | YES (join code) |
| `login_type` | string enum | no (default `email`) | YES |
| `hidden` | boolean | no | YES (filter; pilot shows teaching only) |
| `grades` | array<string> | yes | YES |
| `participant_type` | string enum | no (default `student`) | YES |
| `studentCount` | integer | no | YES |
| `numberOfStudents` | integer | no | (same value as studentCount) |
| `course_display_name` | string | yes | YES (assigned course label) |
| `courseVersionName` | string | yes | YES |
| `unit_id` | integer | yes (`script_id` when unit_group) | YES |
| `unitPosition` | integer | yes | YES |
| `course_id` | integer | yes | maybe (assignment gate) |
| `course_offering_id` | integer | yes | maybe |
| `course_version_id` | integer | yes | no |
| `avatar_color` | integer | yes | YES (card avatar) |
| `avatar_emoji` | integer | yes | YES (card avatar) |
| `demo_type` | string | yes | YES (exclude demo; demo out of scope) |
| `teacherName` | string | no | no |
| `assignedTitle` | string | no (`''`) | no |
| `linkToAssigned` | string(URL) | no | no |
| `currentUnitTitle` | string | no (`''`) | no |
| `linkToCurrentUnit` | string | no (`''`) | no |
| `linkToProgress` | string(URL) | no | no |
| `linkToStudents` | string(URL) | no | no |
| `is_assigned_single_unit_course` | boolean | yes | no |
| `createdAt` | datetime | no | no |
| `sectionInstructors` | array<object> | no | no |
| `primaryInstructor` | object | no | no |
| `lesson_extras` | boolean | no | no |
| `pairing_allowed` | boolean | no | no |
| `tts_autoplay_enabled` | boolean | no | no |
| `sharing_disabled` | boolean | no | no |
| `login_type_name` | string | no | no |
| `script` | object `{id,name,project_sharing}` | no (fields nullable) | no |
| `providerManaged` | boolean | no | no |
| `restrict_section` | boolean | yes | no |
| `post_milestone_disabled` | boolean | no | no |
| `code_review_expires_at` | datetime | yes | no |
| `sync_enabled` | boolean | yes | no |
| `is_assigned_csa` | boolean | no | no |
| `at_risk_age_gated_date` | date | yes | no |
| `at_risk_age_gated_us_state` | string | yes | no |
| `assigned_ai_chat_tools_dependency` | string | yes | no |
| `ai_chat_access_level` | string | no (default `disabled`) | no |
| `students` | null | always null on index | no |

Note on merge precedence: `summarize_for_participant` is the receiver; `summarize`
merges over it, so overlapping keys (`id`, `name`, `hidden`) take the `summarize`
value (identical). Wire keys are a snake_case/camelCase mix as listed above.

### Fields the pilot UI consumes (mapped to legacy card usage)

Legacy `SectionCard` reads `id, name, hidden, demoType, avatar_color,
avatar_emoji, loginType, code`; `SectionCardBody` reads `courseId, unitId,
studentCount`; `CourseContentDropdown` reads `courseDisplayName, unitId,
courseVersionName`. The pilot maps these onto the API's `summarize` keys:
`id, name, code, login_type, hidden, grades, participant_type, studentCount,
course_display_name, courseVersionName, unit_id, unitPosition, avatar_color,
avatar_emoji, demo_type`. Parity is asserted on RENDERED labels, not raw field
equality — see the legacy-vs-API divergence note below.

### Error / edge shapes

| Caller state | Result |
|---|---|
| Signed-out | HTTP 403, empty body (`head :forbidden`); NO login redirect (JSON format). |
| Student account (persisted) | HTTP 200 `[]` (a student instructs no sections). |
| Teacher, no sections | HTTP 200 `[]`. |
| Teacher, N sections | HTTP 200, array of N summaries. |

The pilot renders the empty state for `[]`. Signed-out/student are contract
edges for the parser/handler tests, not rendered scenarios.

### Legacy-vs-API divergence (important)

The legacy home page does NOT call this API; it is server-fed
`Section#concise_summarize` via a `data-dashboard` attribute. `concise_summarize`
and `summarize` overlap but differ: `concise_summarize` has `unitName`,
`ai_tutor_enabled`, and types `code_review_expires_at` as a number and `code` as
non-nullable; `summarize` (the API) omits `unitName`/`ai_tutor_enabled`, adds
`teacherName/assignedTitle/linkTo*/numberOfStudents/primaryInstructor/
restrict_section/demo_type/ai_chat_access_level/…`, and makes `code` nullable.
Consequently the existing core `ConciseSectionSchema` models `concise_summarize`
and MUST NOT be reused for this endpoint.

## Frontend schema / parser + MSW plan

- **Schema:** new `SectionListSummarySchema` (renamed from the planned
  `SectionSummarySchema` in Session A, commit `5c280e06d1a` — barrel collision
  with the levels domain; wire contract, field set, camelCasing unchanged) in
  `frontend/packages/core/src/api/dashboard/sections/sections.schemata.ts`,
  modeling only the consumed fields above, camelCasing via
  `.transform(d => camelcaseKeys(d, {deep: true}))` (domain convention). Unmodeled
  keys are dropped by zod's default strip. Type `SectionListSummary` in
  `sections.types.ts`.
- **API method:** `listSections()` in `sections.api.ts` →
  `transport.request<unknown>({method:'GET', url:'/api/v1/sections'})` →
  `z.array(SectionListSummarySchema).parse(raw)`.
- **Query hook:** `useSections` + key in `sections.query.ts` / `sections.keys.ts`.
- **Parser tests** (`sections.api.test.ts`, `fakeTransport`): empty `[]`;
  two-element list → camelCased objects with consumed fields; reject on element
  missing `id`/`name`.
- **MSW:** `http.get('*/api/v1/sections', …)` in
  `frontend/packages/core/src/api/mocks/`, serving `empty` (`[]`) or `list` (two
  summaries) fixtures shipped in the package (`src/fixtures/`).
