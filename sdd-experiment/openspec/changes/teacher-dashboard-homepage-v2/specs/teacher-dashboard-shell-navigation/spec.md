# Spec delta: teacher-dashboard-shell-navigation (from teacher-dashboard-shell)

## MODIFIED Requirements

### Requirement: Candidate route tree with legacy-equivalent paths
Studio SHALL serve, under `/frontend-studio/teacher_dashboard/`, the routes
`home` and `sections/:sectionId/<tab>` using the exact legacy path segments
(underscores preserved: `login_info`, `text_responses`, `ai_chat_settings`,
`manage_students`, etc. per `TeacherNavigationPaths.tsx`). The `home` route
mounts the migrated Teacher Homepage V2 page component from
`@code-dot-org/teacher-dashboard` (no longer a placeholder), and the shell's
per-tab map entry for `home` resolves to the candidate route. Every other
tab's content area is either a migrated feature (later changes) or a
full-page link to the legacy URL.

#### Scenario: Deep link resolves
- **WHEN** a signed-in teacher opens
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/roster`
- **THEN** the candidate shell renders the sidebar with `roster` active and
  the tab-content region for that route (roster content itself arrives with
  the manage-students change)

#### Scenario: Home mounts the homepage
- **WHEN** a signed-in teacher opens
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
- **THEN** the migrated homepage renders inside the shell with live data
  from the bootstrap and home endpoints

#### Scenario: Legacy routes untouched
- **WHEN** a teacher opens `/teacher_dashboard/home` or
  `/teacher_dashboard/sections/:id/*`
- **THEN** the legacy page renders exactly as before this change
