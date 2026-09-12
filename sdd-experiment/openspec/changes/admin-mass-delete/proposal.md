# admin-mass-delete

## Why

Mass student-progress deletion is the only admin tool that already has a
React UI (MassDeleteContainer.tsx in apps/), stranded in the legacy
webpack bundle. Migrating it into packages/admin removes the last
apps/-side admin React code and puts the most dangerous bulk operation
behind sudo and durable audit.

## What Changes

- New /api/admin endpoints replacing the two POSTs the component uses
  (admin_users#convert_usernames_to_ids preview and
  #delete_user_progress execution); execution is sudo-gated and audited
  with one row per affected user.
- MassDeleteContainer ported from
  apps/src/templates/admin/MassDeleteContainer.tsx into packages/admin
  (DSCO components, CSS modules, Vitest), preserving its two-phase
  preview→confirm flow; apps/ entry point and HAML page retire in
  admin-haml-decommission.
- Legacy page remains functional until decommission.

## Capabilities

### New Capabilities

- `admin-mass-progress-deletion`: two-phase (preview, sudo-gated
  execute) bulk deletion of student progress via audited API + SPA page.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin bulk controller wrapping the conversion/deletion
  logic from admin_users_controller.
- frontend/packages/admin gains the ported component;
  apps/src/templates/admin and its entry point are marked for removal in
  decommission.
- Depends on: admin-api-foundation (sudo + audit), admin-frontend-shell,
  admin-user-lifecycle (confirmation + sudo_required UX conventions).
