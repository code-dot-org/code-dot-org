# Teacher Dashboard Homepage/Roster OpenSpec Planning Prompt

Create planning-only OpenSpec docs for migrating Code.org Teacher Homepage V2 and
the student roster page into `frontend/`.

This session produces OpenSpec docs and opens a draft PR containing those
artifacts. Do not implement product code, scaffold packages, move files, edit app
behavior, use Playwright MCP, or chase subagent loops. Fable owns the planning
and writes vanilla OpenSpec artifacts directly.

Use the OpenSpec Claude skills to do the work:

1. Use `openspec-explore` during exploration.
2. Use `openspec-propose` to write the OpenSpec change.
3. Repeat the explore -> propose sequence separately for each of the three
   changes: shell, homepage v2, manage students.
4. After migration planning, use only the context already gathered in this
   session to propose logical teacher-dashboard improvement buckets. Do not
   explore more code for improvements.

Do not combine unrelated changes into one proposal.

## Scope

- Homepage legacy baseline: `http://localhost-studio.code.org:9000/teacher_dashboard/home`
- Homepage candidate route: `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
- Roster legacy baseline: `http://localhost-studio.code.org:9000/teacher_dashboard/sections/:sectionId/roster`
- Roster legacy alias: `http://localhost-studio.code.org:9000/teacher_dashboard/sections/:sectionId/manage_students`
- Roster candidate route: `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/:sectionId/roster`
- Candidate alias: `/frontend-studio/teacher_dashboard/sections/:sectionId/manage_students` redirects to roster.
- Homepage source: `apps/src/templates/studioHomepages/teacherHomepageV2/`
- Roster source: `apps/src/templates/manageStudents/` plus direct `teacherDashboard` dependencies.
- Bootstrap source: `apps/src/sites/studio/pages/teacher_dashboard/show.js`
- HAML data contract: `dashboard/app/views/teacher_dashboard/show.html.haml`

Do not include other teacher dashboard tabs except where homepage or roster link
to them.

## Output

Create three OpenSpec changes:

```text
sdd-experiment/openspec/changes/teacher-dashboard-shell/
sdd-experiment/openspec/changes/teacher-dashboard-homepage-v2/
sdd-experiment/openspec/changes/teacher-dashboard-manage-students/
```

Also create additional OpenSpec changes for actionable Teacher Dashboard
improvements identified from context already gathered for the migration specs.
Bucket those improvements logically.
Keep improvement proposals separate from migration/parity proposals.
Create improvement OpenSpecs only when the gathered context provides concrete
evidence and a change is specific enough to review. Do not write speculative
wish-list items, and do not inspect additional source solely for improvement
ideas.

Use standard OpenSpec structure and conventions. Do not add custom artifact files
unless the local OpenSpec workflow already expects them.

Also write a short PR summary draft under:

```text
sdd-experiment/teacher-dashboard-migration/openspec-pr-summary.md
```

Before creating the PR, ensure the OpenSpec artifacts are git-indexable:

- Use `git add -f` for OpenSpec paths if they are ignored.
- If ignored/excluded paths still cannot be included, move or copy the artifacts
  to a git-indexable directory under `sdd-experiment/teacher-dashboard-migration/`
  and preserve their original relative paths in the filenames or directory
  layout.
- Verify `git status --short` shows the OpenSpec artifacts that will be in the
  PR.

Create a draft GitHub PR for the OpenSpec artifacts only. The PR should make it
clear that it is planning-only and contains no implementation.

## Planning Rules

- Load and apply the `design-system` skill before writing the specs.
- Follow `frontend/AGENTS.md`, `frontend/README.md`, `frontend/apps/studio/README.md`, `frontend/packages/users/README.md`, `frontend/packages/core/src/api/README.md`, and `frontend/packages/e2e-tests/README.md`.
- Plan the normal frontend package path: turbo package generator first, then React/Vite adaptations as needed.
- Plan both standalone MSW mode and live local/test integration mode.
- Use `frontend/packages/markdown` where legacy UI used `SafeMarkdown` or equivalent markdown behavior.
- Prefer `git mv`, extraction, wrappers, and adapters over rewrite. Roster is legacy UI; plan to move/refactor it before replacing it.
- Preserve the HAML `data-dashboard` contract as the legacy source of truth, but do not make the Vite candidate depend on Rails SSR script injection.
- Plan Rails-way `Api::V1` bootstrap/data endpoints for the shell, homepage, and roster wherever no equivalent API exists. Default namespace should be `Api::V1::TeacherDashboard::*`.
- Derive those API contracts from the existing HAML script data, controller ivars, serializers, and legacy async calls. Include Rails field-equivalence tests so the API proves it returns the same contract the legacy page receives today.
- Keep legacy `/teacher_dashboard/home` and `/teacher_dashboard/sections/:sectionId/roster` stable.
- Record blocker evidence for any planned rewrite.
- Include a concise design-system mapping in the relevant specs: legacy UI -> DSCO/MUI/component-library target, including MUI equivalents and any temporary wrapper needs.

## Visual Testing Requirements

In the OpenSpec tasks/specs, require implementation to capture baseline and
checkpoint images only for legacy surfaces that already use DSCO/component-library
and where Fable determines visual parity is part of the migration contract.
For non-DSCO legacy UI, do not require visual parity; plan behavior, a11y, and
design-system migration requirements instead.

Do not perform visual capture in this planning session. Do not use Playwright
MCP now.

The implementation phase may use Playwright MCP to capture images. Put that
availability in the OpenSpec so implementers know it is allowed.

The specs should name the features or locations that need images, not dictate
the low-level implementation mechanics.

Fable should discover the visual and behavior parity scenarios from the legacy
code, routes, tests, data contracts, and UI states, then put the resulting
coverage in the OpenSpec tasks/specs. Do not use a fixed scenario checklist.

Each OpenSpec must include task line items for Fable-determined behavior
scenario discovery and, where applicable, visual parity planning.

MSW standalone mode must expose the discovered offline scenarios as visible
scenario choices.

## Environment Notes

- Use only `http://localhost-studio.code.org:9000` for browser URLs in docs.
- Treat `:9000` as the frontend-facing Studio server.
- If docs mention verification, require serving-checkout validation before visual capture: Rails and apps server process cwd must point at the worktree.
- Do not instruct agents to use `:3000`.

## Usage

Check `claude -p "/usage"` at start and before final report. Pause at `>=95%`
current session, current week all-model, or current week Fable usage.

## Stop Condition

Stop when the three OpenSpec changes and PR summary draft are written,
self-reviewed for internal consistency, included in the git index, and published
as a draft PR. Do not begin implementation.
