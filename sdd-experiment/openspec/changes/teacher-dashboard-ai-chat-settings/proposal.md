# Proposal: teacher-dashboard-ai-chat-settings

Position 14 in the migration sequence (after the core tabs). Depends on
`teacher-dashboard-shell`.

## Why

The AI surfaces of the dashboard are entry points into the aichat and
AI-differentiation systems, not rebuilds of them: the `ai_chat_settings`
tab mounts `AiChatAccessControls` (`apps/src/aichat/views/accessControls/`)
guarded by a selected section (no section → redirect to progress,
Router:326-338); the AI-differentiation chat FAB
(`displayDifferentiationChat()`, called at legacy boot from `show.js:117`)
appears under experiment `ai-differentiation` AND
`aiDifferentiationEnabled`. Both must exist in the candidate or teachers
with AI features lose them at cutover.

## What Changes

- Candidate route `.../sections/:sectionId/ai_chat_settings` renders the
  ported access-controls tab; without a selected section the route
  redirects (replace) to progress, as legacy.
- `AiChatAccessControls` and its student access-level machinery move with
  adapters (its endpoints — `ai_chat_access_level`, per-student access
  updates — recorded and wrapped). Dual-copy policy applies if the aichat
  import graph is shared with the aichat lab surfaces; blocker evidence
  recorded.
- The AI-differentiation FAB entry point is wired at the candidate shell
  level under the same two gates (experiment + `aiDifferentiationEnabled`
  from section/user data), reusing the aichat implementation rather than
  duplicating it.
- Shell per-tab map flips `ai_chat_settings` to the candidate route.
- Pixel gate applies (modern TSX/DSCO aichat surface) for the
  access-controls tab.

## Capabilities

### New Capabilities

- `teacher-dashboard-ai-entry-points`: the ai_chat_settings tab (guard +
  access controls) and the AI-differentiation FAB entry point under their
  gates.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (AI area), core wrappers/mocks,
  Studio route content, shell map entry. No Rails changes; aichat backend
  untouched.
