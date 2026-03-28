# frontend/ — Turborepo workspace

This directory contains the Turborepo workspace for standalone frontend packages (`packages/`) and apps (`apps/`).

## Finalization steps

When making changes to any package under `frontend/packages/` or `frontend/apps/`, run these steps from the `frontend/` directory before reporting success:

1. `yarn lint:fix` — auto-fixes lint errors across all changed packages (runs ESLint with `--fix` via Turborepo)
2. `yarn release:dryrun` — validates that all packages are releasable (checks versioning, exports, and build output)
