# Feature domains and shared conventions

Orchestrator artifact (Phase 2). Every domain owner reads this file in full, plus its own slice of `inventory.yaml`. Nothing here is user documentation.

## Audiences and information architecture

Four audience roots under `docs/`:

| Root | Audience | Organizing principle |
|---|---|---|
| `docs/students/` | Students. Also a small `parents-and-guardians/` subsection for the adults who receive parent letters and permission requests. | Goals: sign in, join a class, do my work, make and share projects, get help. Short pages, plain words. |
| `docs/teachers/` | Teachers, including teachers who are also professional-learning participants. | Classroom tasks: set up a class, assign, watch progress, give feedback, manage students, train. |
| `docs/district-administrators/` | School and district staff, LMS administrators, principals. | Honest scope. See "District administrator decision". |
| `docs/developers/` | Engineers and coding agents working in this repo. Internal Code.org staff tools and levelbuilder live here too, clearly marked internal. | GitLab-style Concept / Task / Reference / Troubleshooting. |

Second level inside each audience root is a task group, not a feature name (`teachers/classes/`, not `teachers/sections/`). Third level is one page per meaningful task, concept, or reference topic. Owners propose the second level for their domain in their plan file; Fable reconciles naming across domains before writing starts.

### District administrator decision (Fable, 2026-09-09)

The code has no district-administrator role: `user_type` is `student` or `teacher`; Clever `district_admin` and `school_admin` collapse to `teacher`; `educator_role` is self-reported and unread. The audience root still exists because these people arrive with real goals. Its pages document what the product actually offers them: LMS (LTI 1.3) integration setup and what it provisions; how Clever and Google Classroom district rostering behaves; principal approval for professional-learning applications; school and district data (school association, census); how to get district-level reporting today (regional partners, Code.org staff); and a plain statement of what is not available (no district dashboard, no district-scoped roster or progress view). No page may imply a capability that does not exist. Owner: `integrations-schools-districts`.

## Product domains

Each domain lists the inventory `area` values it absorbs and the exceptions. `inventory.yaml` carries the result in `assigned_domain`.

1. **accounts-and-access** — area `identity-and-accounts`; from `safety-privacy-and-compliance`: everything about account state and consent (`cap-*`, `under-13-restrictions`, `account-*`, `race-and-demographics-interstitial`, `strict-password-policy`, `safe-browsing-check`); from `notifications-and-email`: `account-email-preferences`, `email-parent-messages`, `email-teacher-messages`, `email-student-unenrolled`, `in-product-notifications`, `announcements`, `new-feature-feedback`, `sms-send`. Roles: student, teacher, parent. Also owns the developer concept page for the auth stack (`dev-auth-stack`, `dev-cancancan-layer`) because the same owner must understand sign-in end to end.
2. **classrooms-and-progress** — areas `sections-and-rosters`, `progress-and-assessment`; from `lms-and-integrations`: the teacher-facing roster sync tasks (`teacher-roster-sync-google`, `teacher-roster-sync-clever`, `teacher-roster-sync-lti`). Roles: teacher, student. Rubric AI evaluation is documented here as a teacher task; the AI subsystem belongs to `ai-features`.
3. **curriculum-and-assignment** — area `curriculum-catalog-and-assignment`; area `recognition-and-marketing-surfaces` (home pages, certificates, Hour of Code, incubator, promotions, global edition). Roles: teacher, student. Owns the `published_state` visibility matrix (open question 3) jointly with `levelbuilder-and-curriculum-pipeline`; curriculum owns the reader-facing statement.
4. **labs-and-learning-experience** — area `learning-experience-and-labs`; from `dev-frontend-platform`: `level-app-options-handoff`, `lab2-framework`, `legacy-lab-boot`, `blockly-fork`; from `dev-i18n`: `locale-switch`. Roles: student, developer. Writes the student lab pages and the developer labs-runtime docs. Open question 17 (lab2 vs `app_options`) is this owner's to settle.
5. **projects-and-sharing** — area `projects-and-sharing`; from `safety-privacy-and-compliance`: `project-share-warnings`, `project-report-abuse`, `project-image-upload-warning`, `content-proxies`; from `dev-rails-platform`: `project-storage-channels`, `project-sandboxed-preview`, `dev-project-storage-stack`. Roles: student, teacher, developer. Must state plainly that loading a project by channel id needs no sign-in (open question 7).
6. **ai-features** — area `ai-features`; from `safety-privacy-and-compliance`: `ai-safety-pipeline`; from `internal-staff-tools`: `ai-prompt-management`, `ai-observability`. Roles: student, teacher, developer. Every page states availability (flag, experiment, pilot) because this area is the most gated in the product. Open questions 5 (Chatter) and 8 (aichat auth) resolve here.
7. **professional-learning** — area `professional-learning`. Roles: teacher, facilitator, regional partner, principal (approval only). Includes workshop certificates.
8. **integrations-schools-districts** — area `lms-and-integrations` minus the three teacher roster-sync tasks; area `schools-districts-and-administration`. Roles: district administrator, teacher, developer. Owns the whole `docs/district-administrators/` root and the developer pages for LTI as a protocol (`lms-jwks-endpoint`, LTI services).
9. **levelbuilder-and-curriculum-pipeline** — area `levelbuilder-and-curriculum-authoring` (coarse grain, internal audience under `docs/developers/curriculum/`); area `dev-curriculum-pipeline`; `course-published-state-lifecycle` shared with curriculum. Roles: levelbuilder (internal), developer.

## Developer domains

10. **engineering-platform** — areas `dev-rails-platform` (minus the three project-storage items), `dev-frontend-platform` (minus the four lab-runtime items), `dev-availability-and-config`, `dev-i18n` (minus `locale-switch`); from `internal-staff-tools`: `staff-dcdo-console`, `staff-gatekeeper-console`, `staff-feature-mode`, `staff-dynamic-config-viewer`, `staff-pilot-management`, `user-join-pilot-by-link`. Owns the system mental model: Rails monolith shape, Services/Policies/Queries, Sinatra middleware, background jobs, caching, email pipeline, observability (open question 12), `apps/` bundle, `frontend/` Turborepo, design system, flags and experiments. Reconciles the existing top-level docs (README, ARCHITECTURE.md, SETUP.md, frontend/AGENTS.md, apps/README.md, docs/*.md) rather than duplicating them.
11. **delivery-and-operations** — areas `dev-deploy-and-infra`, `dev-testing-and-verification`; the remaining `internal-staff-tools` (admin account tools, impersonation, permission grants, moderation, reports, NPS) as one or two internal reference pages. Owns local setup, test suites, CI, deploy targets (open question 16), adhoc environments, and the test-only API. Also owns the maintenance runbook for this documentation system itself (`docs/developers/documentation/`), written last.

## Shared conventions (binding on every owner)

**Files.** One page per file, `kebab-case.md`, under the audience root. Images in an `images/` directory beside the page, named `<page-slug>-<what>.png`. No page may depend on an image to be understood.

**Frontmatter.** Exactly:

```yaml
---
title: Assign a course to a class
description: One sentence a search result can show.
type: task        # concept | task | reference | troubleshooting | tutorial
---
```

Nothing else unless Fable adds a field. No ids, no dates, no revisions in frontmatter; those live in evidence.

**Evidence.** `.docs-evidence/<audience>/<same path as the page>.json`, one per page, following `.docs-evidence/schema.json`. Fields: `sources` (paths), `tests`, `routes`, `flags`, `journey` (spec path or null), `verification` (`{result: VERIFIED|OBSERVED|STRONGLY_SUPPORTED|INFERRED|BLOCKED, revision, date, notes}`), `screenshots` (`[{path, journey, revision}]`), `unresolved` (list). Evidence is disposable and agent-maintained; keep it terse.

**Journeys.** Browser verification is a Playwright spec, never the shared MCP browser. Specs live where the platform-setup agent placed the docs journeys harness (see `.docs-work/platform.md` once written), reuse the e2e `createUser` fixtures, target `http://localhost-studio.code.org:3000` only, create fresh throwaway accounts, use viewport 1280x800 and light theme for screenshots, and save screenshots straight into the page's `images/` directory. A journey that cannot run records BLOCKED with the reason; nobody fabricates a screenshot.

**Terminology.** The product is **CodeAI**; write "code.org" only in URLs and email addresses. Use the label the UI shows (check the browser, not the constant name). Say "class" when the UI says class and "section" when the UI says section; record which one the UI uses in your plan so Fable can unify. Teachers "assign"; students "join". Never expose implementation names (`UserLevel`, `Follower`, DCDO) in student or teacher pages.

**Documentation, not a story (user, 2026-09-10; supersedes the earlier "Reader first", "Page shape", and "Topic pages" wording on voice and openings).** Apply the stylebook literally. A page names the reader's goal in its title and in one opening sentence that says what the page covers; no scene-setting, no second-person narrative ("You opened App Lab and you want to build something"), no hand-offs between sections ("Now that a button works, you probably want..."), no describing the reader's feelings or situation. Structure per GitHub Docs: a one- or two-sentence intro; an "About ..." paragraph or section only where a concept is needed to act safely; "Prerequisites" before any dependent action; one numbered procedure per task section, steps starting with an imperative verb, location before control, bold UI labels, one action per step; a one-line verification where it helps ("The button appears in the preview."); alternatives in their own sections; a "Troubleshooting" section led by the observable problem; "Further reading" or "Next steps" with two to four links. Calm, direct, neutral register. The reader's goal still frames what is on the page (help, not a spec sheet; no feature inventories), but the register is documentation.

**User manual, not an answer key (user, 2026-09-10).** Student and teacher pages document how to operate the product: where a control is, what it does, how to use it, what you see. They never teach the curriculum or solve a level: no code recipes that implement a lesson concept (wiring `onEvent` to `setText`), no worked answers, no "make the sprite move" tutorials. Naming where a block category lives is tool documentation; showing which blocks to combine for an effect is an answer key. A "Prerequisites" section appears only when a real precondition exists (an account type, a permission, a completed setup); "the lab is open" is not one.

**Tool reference pages (user, 2026-09-10; evidence `.docs-work/raw/tool-manual-samples.md`).** A page about a lab or another editor-like surface is a reference to that tool, organized by its persistent regions and features (the Design tab, the element tray, the properties panel, screens, the toolbox, blocks and text, Run, the Debug Console), never by clicks. Headings name the region or feature. A single action is one prose sentence; numbered steps only for a real multi-step workflow. Every section must add something beyond the click: the options and variants, a limit or non-obvious behavior, a shortcut, the resulting state, or the concept the reader needs. Depth comes from the tool's real options and limits, grounded in code, tests, or the running app. The page opens with orientation and links to task pages instead of embedding procedures for tasks documented elsewhere. `type: reference`. Images on tool reference pages (user approved on App Lab, 2026-09-10): one viewport image of the whole workspace in the orientation section, plus one tight crop per region or feature section the page describes (element tray, properties panel, screen dropdown, toolbox, blocks/text toggle, Run and Reset, Debug Console), all taken by the lab's journey; roughly 6 to 12 images per reference page. Task pages keep the crops-only rule. Image truth (user, 2026-09-10): an image must show exactly the region its section and alt text describe, captured in a realistic state (a section with enrolled students who have progress, a project list with projects, a workspace with code), never an empty or placeholder state; an image that does not match its section or shows nothing is deleted. Every image is looked at by a reviewer before it ships. Coverage (user, 2026-09-10): on a task page, every step that names a control, panel, dialog, or tab the reader must find gets a tight crop of it in realistic state, placed after that step; the only exception is a single obvious bold-named button on an otherwise empty screen. Data needed to reach a state (a student with submitted work, a section with progress) is seeded through the product for throwaway accounts, never declared BLOCKED without trying.

**Style.** Load the stylebook skill before writing: `github-docs` for student, teacher, and district pages (use `govuk` for eligibility and decision pages, `microsoft-writing-style` for UI text and support tone); `gitlab-docs` for developer concept, task, reference, and troubleshooting pages; `google-developer-docs` for setup and how-to; `mdn-web-docs` for technical explanation. Student pages: short sentences, one goal per page, minimal prerequisites. Choose the page type before writing and state it in `type`. No page restates its title, opens with "This guide", or ends with a summary.

**Evidence grades.** VERIFIED (walked in the browser), OBSERVED (rails runner, db, curl), STRONGLY SUPPORTED (code and tests agree), INFERRED, AMBIGUOUS, BLOCKED, CONTRADICTED. A page may only state as fact what is VERIFIED, OBSERVED, or STRONGLY SUPPORTED. Anything else is left out or goes to `unresolved` and to Fable.

**Availability.** Distinguish general availability from flag-, experiment-, pilot-, or environment-gated behavior. Gated behavior is documented only if a real user can reach it in production today; otherwise it is recorded in evidence and omitted from the page.

**Server.** The dashboard at http://localhost-studio.code.org:3000 is long-running and shared. Never start, stop, or restart it, and never launch another Rails, Puma, webpack, or rspack process. If it is unreachable, record BLOCKED (environment) and report to Fable.

**Usage.** Run `~/.claude/skills/usage-guard/check-usage.sh` at start, before browser work, and at the end. Stop at 90% on any window, save state, report `USAGE BREACH`. At most one Sonnet helper alive at a time per owner.

## Waves (max 3 agents in flight)

- Wave 0: platform setup (Opus) + two Sonnet open-question sweeps.
- Wave 1: classrooms-and-progress, accounts-and-access, curriculum-and-assignment.
- Wave 2: labs-and-learning-experience, projects-and-sharing, integrations-schools-districts.
- Wave 3: ai-features, professional-learning, levelbuilder-and-curriculum-pipeline.
- Wave 4: engineering-platform, delivery-and-operations.
- Then: Fable integration review, editorial review agents, maintenance runbook.

Each owner produces a plan first (`.docs-work/domains/<domain>/plan.md`: proposed pages, page types, journeys, terminology observed, questions for Fable). Fable reviews plans between waves only when a cross-domain naming or scope conflict appears; otherwise owners proceed straight to investigation and writing.

## IA collapse (user, 2026-09-10)

The four audience roots (`students/`, `teachers/`, `district-administrators/`, `developers/`) are collapsed to two:

- `docs/guide/` -- **User guide**. Organized by topic, not persona. Ten topic directories: getting-started, sections, curriculum, labs, projects, progress, ai, professional-learning, integrations, privacy. Students, teachers, and district administrators all land here.
- `docs/developers/` -- unchanged.

Voice rule: procedures address whoever performs them as "you". When the actor differs from the likely reader, the heading names the actor ("How students sign in with a section code", "What students see after you assign a course"). No persona labels in navigation, titles, or descriptions.
