# Tasks: user-write-api-catalog

Sequenced after user-write-api-foundation; before (and binding on) the
three per-surface migration changes.

## 1. Inventory

- [ ] 1.1 Re-run the mutation-site sweep (update/save/setters across
      dashboard/app/controllers, dashboard/app/jobs, dashboard/lib);
      commit the classified inventory table to this change dir
- [ ] 1.2 Confirm exemption list with reviewers (Devise-internal,
      test_controller, ability.rb sentinel)

## 2. Catalog

- [ ] 2.1 Ratify command names/inputs with the team (they are referenced
      by three sibling changes — renames after this point are breaking)
- [ ] 2.2 Record per-command absorbed-callback notes (which of the 18
      User callbacks each command will eventually own explicitly)

## 3. Method + enforcement

- [ ] 3.1 Land the characterization-test helper (shared request-spec
      harness capturing status/body/row-deltas/side effects) used by all
      per-surface changes
- [ ] 3.2 Define cop todo-list freeze in lint config; document the
      graduation checklist in the cop's docs
