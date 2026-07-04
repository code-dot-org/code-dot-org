# Design: teacher-dashboard-ai-chat-settings

## Context

`AiChatAccessControls` (TSX, aichat module) manages per-student AI chat
access for a section; endpoints include
`/api/v1/sections/.../ai_chat_access_level` family (recorded at
implementation). The tab renders only with a selected section
(Router:326-338 redirect guard). The AI-diff FAB is boot-level UI gated on
experiment `ai-differentiation` + `aiDifferentiationEnabled`
(Router:322-323, show.js:117).

## Goals / Non-Goals

**Goals:** the two AI entry points in the candidate under their exact
gates; access-controls behavior parity.

**Non-Goals:** no rebuild of aichat internals (chat UI, model plumbing) or
AI-differentiation internals; no new AI settings.

## Decisions

- D1. The access-controls component moves with adapters if its import
  graph is dashboard-local; if it is entangled with aichat lab surfaces,
  the tab consumes it from its current home through a thin wrapper and the
  extraction is deferred with blocker evidence — entry point first,
  relocation second.
- D2. The guard redirect is route-level in the candidate (beforeLoad), same
  replace semantics as legacy.
- D3. The FAB mounts at the shell layout level (it is boot-scoped in
  legacy, not tab-scoped) under the same two gates; scenario axes cover
  both arms of each gate.

## Risks / Trade-offs

- [aichat import graph is large and shared] → D1's wrapper path keeps this
  change small; blocker evidence rule governs.
- [Access-level mutations are permission-sensitive] → recorded contracts +
  auth scenarios (non-owner cannot mutate) are mandatory.

## Migration Plan

Record contracts → discovery → tab + guard → FAB gates → flip map entry →
pixel baselines (access-controls tab) → verify. Rollback: revert additive
commits.
