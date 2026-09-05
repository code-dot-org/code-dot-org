# Design: teacher-dashboard-login-info

## Context

`SectionLoginInfo.jsx` (legacy JSX, redux-connected to `teacherSections`)
branches on `SectionLoginType`; uses `SafeMarkdown`, static PNGs
(oauthSignInButtons, syncClever, syncGoogleClassroom), `PrintLoginCards`
from manageStudents, `DemoSectionTooltip`. Parent letter is a separate
webpack entry rendered without layout for printing; it reuses
selected-section data (`@section_summary` with secrets included —
controller#parent_letter, unlike #show which strips `secret_words`).

## Goals / Non-Goals

**Goals:** all six login-type variants, print flows, and the parent letter
in the candidate; the provider axis proven read-only.

**Non-Goals:** no OAuth/sync mutations (roster owns sync); no redesign of
print CSS beyond what the move requires; no pixel gate.

## Decisions

- D1. Move-not-rewrite with adapters (roster pattern); static images move
  as package assets; `SafeMarkdown` → `@code-dot-org/markdown`.
- D2. Parent letter: candidate printable route in Studio (no header/footer;
  print-media CSS preserved from the legacy `emulate_print_media`
  behavior). CONTRACT NOTE recorded: the legacy parent-letter payload
  includes student secrets (`selected_section_summarize` WITHOUT the
  `.except('secret_words')` strip that the dashboard page applies). The
  candidate parent letter therefore needs the secrets-bearing
  selected-section payload; it reuses `GET /dashboardapi/section/:id`
  (which includes secrets per the recorded contract) and MUST NOT widen
  any payload beyond what legacy pages already receive.
- D3. Print certificates remains a link to its existing page (out of
  dashboard scope), matching legacy behavior from the options dropdown and
  this tab.

## Risks / Trade-offs

- [Print fidelity (page breaks, print CSS) differs under Vite] → print
  behavior is part of the behavior gate: a print-preview check per login
  type for login cards and parent letter is a task, not an afterthought.
- [Secrets on the parent-letter payload] → explicitly scoped: candidate
  requests the same endpoint the legacy UI already uses with the same auth
  gate; flagged for security review attention in the change, not silently
  inherited.

## Migration Plan

Data recording (per login type) → discovery → move UI + parent letter →
flip map entry → verify. Rollback: revert additive commits.
