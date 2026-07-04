# Tasks: teacher-dashboard-ai-chat-settings

Position 14. Depends on teacher-dashboard-shell.

## 1. Data + discovery (gate)

- [ ] 1.1 Record the access-level endpoint family (read + mutations);
      typed wrappers + parser tests + MSW handlers; auth scenarios
- [ ] 1.2 Walk oracles (aichat access-controls tests, sources); record
      matrix; MSW fixtures + visible choices (populated, guard-redirect,
      gates matrix, mutation-error)

## 2. Port

- [ ] 2.1 Mount AiChatAccessControls at the candidate route (move with
      adapters if dashboard-local; wrapper + blocker evidence if
      entangled); route-level guard redirect
- [ ] 2.2 Wire the AI-diff FAB at shell layout level under both gates
- [ ] 2.3 Component tests per scenario; axe + keyboard; copy parity

## 3. Visual parity (pixel-gated, access-controls tab)

- [ ] 3.1 Declare regions/masks; capture baselines/checkpoints at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available); wire diff gates

## 4. Integration + verification

- [ ] 4.1 Flip the shell per-tab map entry for `ai_chat_settings`
- [ ] 4.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 4.3 Live mutation round-trip + standalone MSW checks
