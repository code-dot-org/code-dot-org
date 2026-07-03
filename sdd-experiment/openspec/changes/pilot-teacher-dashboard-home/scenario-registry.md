# Scenario Registry — pilot-teacher-dashboard-home

The CEO approves this registry before ANY implementation. Exactly two
scenarios, both narrow and read-only. Baseline behavior source is
`https://test-studio.code.org/teacher_dashboard/home` (legacy, untouched).
Candidate route: `/frontend-studio/teacher_dashboard/home` (canonical
`/teacher_dashboard/home` under the router basepath).

Common dimensions (both scenarios):

- **Actors / auth:** one signed-in teacher (age `21+`, `sign_in_count ≥ 1`).
  Signed-out and student accounts are edge cases for the API contract
  (403 / empty `[]`) documented in api-contract-matrix.md, not rendered
  scenarios here.
- **API contracts:** `GET /api/v1/sections` only (see api-contract-matrix.md).
- **Package / owners:** UI + tests + fixtures owned by
  `@code-dot-org/teacher-dashboard`; data method owned by
  `@code-dot-org/core` `sections` domain; route + lazy boundary owned by
  `frontend/apps/studio`.
- **Flags / locale / Global Edition:** locale `en-US`; NO experiment/DCDO flag
  is required or set (`demo-section` OFF, `ai-differentiation` OFF,
  onboarding/tours OFF, promotions not rendered, rebrand banner OFF); Global
  Edition OUT of scope (no `ge_region` cookie). If any flag must change to make
  a scenario deterministic, that is a refinement request, not an in-scope edit.
  The candidate does not read these flags at all — it renders only the section
  region — so determinism comes from MSW fixtures, not flag manipulation.
- **Determinism note:** the strict candidate gate runs against the package's
  standalone MSW shell (no Rails/DB/auth); the live parity capture runs against
  test-studio using the sanctioned Playwright fixtures below.

---

## TD-HOME-EMPTY — signed-in teacher, zero sections, empty home region

- **Legacy source:** `apps/src/templates/studioHomepages/teacherHomepageV2/EmptyHomepage.tsx`
  (via `TeacherHomepage.tsx` numSections===0 branch), rendering the shared
  `apps/src/templates/teacherNavigation/EmptyState.tsx`. Region bound:
  `#teacher-dashboard` content, empty-state block (no `#ui-test-section-list`).
- **Candidate route:** `/frontend-studio/teacher_dashboard/home`.
- **Section state:** teacher instructs zero sections.
- **Curriculum state:** none.
- **Student / progress state:** none.
- **API response:** `GET /api/v1/sections` → `200 []`.
- **Fixture recipe (sanctioned helpers):**
  - Live (Playwright, test-studio): `signInAsNewUser({type: 'teacher', name})`.
    A freshly created teacher owns no sections — no further setup.
  - Strict candidate (MSW): standalone shell with the `empty` fixture (`[]`).
- **Assertions:**
  - Empty-state headline, description, and image render.
  - No section card / no `<ol>` list region present in the DOM.
  - Region exposes a single logical heading.
- **Visual coverage:** REQUIRED — region-scoped parity check on the empty region
  (strict candidate self-baseline; advisory legacy side-by-side).
- **A11y coverage:** REQUIRED — scoped axe pass; keyboard reachability of any
  focusable element; visible `:focus-visible`.
- **Coverage decision:** REQUIRED.

---

## TD-HOME-SECTION-LIST — signed-in teacher, two sections, read-only cards

- **Legacy source:** `apps/src/templates/studioHomepages/teacherHomepageV2/SectionList.tsx`
  → `SectionCard.tsx` / `SectionCardBody.tsx` / `CourseContentDropdown.tsx`.
  Region bound: `<ol id="ui-test-section-list">` (tightest); optionally
  `#teacher-home-header` for the title/toggle.
- **Candidate route:** `/frontend-studio/teacher_dashboard/home`.
- **Section state:** teacher instructs exactly two student sections:
  - Section A: no course assignment; 0 students.
  - Section B: assigned to `ui-test-single-unit-course-2026` unit 1; 1 joined
    student.
- **Curriculum state:** course `ui-test-single-unit-course-2026` (script
  `ui-test-single-unit-2026`, title "Single-Unit Course 2026"), unit position 1.
  Confirmed present in `dashboard/test/ui/config/courses/` on test-studio.
- **Student / progress state:** one student joined to Section B; progress not
  asserted (read-only card shows count only).
- **API response:** `GET /api/v1/sections` → `200` array of the two section
  summaries (fields per api-contract-matrix.md).
- **Fixture recipe (sanctioned helpers):**
  - Live (Playwright, test-studio), teacher session, reloading to refresh CSRF
    between authenticated calls:
    1. `signInAsNewUser({type: 'teacher', name})`.
    2. Section A (unassigned): `POST /dashboardapi/sections`
       `{login_type: 'email', participant_type: 'student'}`.
    3. Section B (assigned): `POST /api/test/create_student_section_assigned_to_course_and_unit`
       `{course_name: 'ui-test-single-unit-course-2026', unit_position: 1}`;
       capture `section_code`.
    4. Join one student to Section B: create a student via
       `createUser({type: 'student', …})`, switch to the student session
       (reload), `POST /join/${sectionCode}`.
    - (A thin `createTeacherWithSections` wrapper analogous to
      `createTeacherAssociatedStudent` may be added in e2e — building block
      endpoints already exist; the wrapper introduces no new behavior.)
  - Strict candidate (MSW): standalone shell with the `list` fixture (two
    summaries above).
- **Assertions:**
  - Exactly two section cards render in the list region.
  - Section B card shows the "Single-Unit Course 2026" course display name and
    student count 1.
  - Section A card shows the unassigned affordance and student count 0.
  - Each card shows a read-only avatar label rendered from
    `avatar_color`/`avatar_emoji` via the legacy mapping (indexed
    COLORS/EMOJIS with clamp-to-0 fallback; `role="img"` named
    "{Color}, {Emoji}"). (Absorbed from ceo-decision-01's avatar
    confirmation per ceo-decision-03 — the assertion list had never
    picked it up.)
  - Card labels use legacy-equivalent terminology: "Section code", not
    "Join code" (ceo-decision-03).
  - No mutating control present or wired
    (create/edit/archive/delete/reorder/add-students/assign-course).
- **Visual coverage:** REQUIRED — region-scoped parity check on the
  `#ui-test-section-list` region (strict candidate self-baseline; advisory
  legacy side-by-side), volatile elements masked per visual-artifacts.md.
- **A11y coverage:** REQUIRED — scoped axe pass; full keyboard reachability of
  the list; visible `:focus-visible`; semantic list markup.
- **Coverage decision:** REQUIRED.

---

## Explicitly deferred / out-of-scope (not scenarios)

Archived-sections view; demo-section state; promotions column; onboarding
tours; AI differentiation; logo-transition animation; drawers/NPS/school-info
popups; any mutation, navigation-away, or progress/roster/materials/settings
surface. These are masked, disabled, or simply not built (see proposal Out of
Scope, verbatim, and visual-artifacts.md determinism controls).
