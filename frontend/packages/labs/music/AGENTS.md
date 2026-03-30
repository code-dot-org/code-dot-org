# @code-dot-org/music-lab

## Keeping documentation up to date

When making changes, check if the following docs need updates:

- **[docs/architecture.md](./docs/architecture.md)** — Update when changing:

  - How the lab is registered in Studio (`labs.ts`, `getLabEntrypoint.ts`)
  - Init ordering (if `initializeCodeStudioConfig()` moves or new init steps are added)
  - Build output shape (entry point, formats, externalized deps)

- **[README.md](./README.md)** — Update when changing:

  - Public API surface (the exported root component contract)
  - Dashboard API usage patterns
  - Dev server setup

- **This file (AGENTS.md)** — Update when adding new constraints agents would violate.
