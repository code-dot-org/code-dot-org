# Proposal: teacher-dashboard-login-info

Position 5 in the migration sequence. Depends on `teacher-dashboard-shell`;
shares moved print components with `teacher-dashboard-manage-students`.

## Why

Login info (`.../sections/:sectionId/login_info`) is read-only but fans
across the whole provider axis: `SectionLoginInfo.jsx` branches per the six
login types (word, picture, email, google_classroom, clever, lti_v1 —
`LoginTypeConstants.tsx`), renders `SignInInstructions` per type, provider
sync imagery for Clever/Google Classroom, localized `login_type_name`
including the LTI issuer name (`section.rb:587-591`), and the print
surfaces: print login cards, print certificates, and the standalone
printable parent letter (`ParentLetter.jsx`, own webpack entry;
`TeacherDashboardController#parent_letter` renders `layout: false`).
Migrating it exercises the LMS/provider scenario axis with zero mutations.

## What Changes

- Candidate route `.../sections/:sectionId/login_info` renders the moved
  login-info page: per-login-type instructions and section-code/join
  content, provider variants with sync imagery, links to print
  certificates, print login cards flow (shared with roster), and the
  parent letter.
- Parent letter gets a candidate printable route (chrome-free) rendering
  the moved `ParentLetter` component from the same section data; the legacy
  `parent_letter` Rails action stays untouched.
- Localized `login_type_name` (incl. LTI issuer) arrives via the
  selected-section payload already wrapped by the shell; no new Rails
  endpoint.
- Shell per-tab map flips `login_info` to the candidate route.
- No pixel gate (legacy non-DSCO JSX with static PNG imagery); behavior,
  copy, and a11y parity; DS mapping recorded.

## Capabilities

### New Capabilities

- `teacher-dashboard-login-info-page`: the moved login-info tab, all six
  login-type variants, print flows, and the printable parent letter.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (login-info area; shared print
  components with roster), Studio routes (tab + printable parent-letter
  route), shell map entry. No Rails changes.
