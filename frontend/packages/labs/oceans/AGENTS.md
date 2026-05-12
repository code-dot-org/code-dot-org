# AGENTS.md

## Project overview

`@code-dot-org/oceans-lab` is the AI for Oceans interactive lab, packaged as
an internal Turborepo workspace under `frontend/packages/labs/oceans/`.

Consumed by:

- `apps/src/fish/Fish.js` (legacy webpack consumer; calls the imperative
  `initAll(...)` named export).
- `frontend/apps/studio/src/modules/labs/oceans/index.tsx` (Vite/TanStack
  consumer; renders the `<OceansLab />` default export wrapped in CSS-only
  responsive shell classes).

Stack: React 18 + TypeScript, Vite library mode, vitest, Playwright,
ESLint flat config, Prettier, Stylelint. The lab still uses Radium for
inline styles and class components — these are inherited from the original
ml-activities source and intentionally preserved verbatim; see "Style
conventions" below.

## Setup

All commands run from `frontend/`:

```bash
yarn install
```

The lab's `dist/` outputs are produced by Vite. Consumers (`apps/`,
`frontend/apps/studio`) pick them up automatically via the `workspace:*`
protocol.

## Development workflow

```bash
# Standalone dev server with mode picker for all 5 app modes (port 5173).
# URL params: ?mode=<appMode>, ?guides=K5, ?tts=<bcp47-locale>.
yarn turbo run dev --filter=@code-dot-org/oceans-lab

# Library build (used by consumers).
yarn turbo run build --filter=@code-dot-org/oceans-lab
```

Edits to source files are picked up by the next consumer build — no link
or symlink step required.

## Testing

```bash
# Unit tests (vitest + jsdom + @testing-library/react).
yarn turbo run test --filter=@code-dot-org/oceans-lab

# Playwright E2E against the standalone dev server.
yarn workspace @code-dot-org/oceans-lab run test:ui     # local
yarn workspace @code-dot-org/oceans-lab run test:ui:ci  # CI mode

# Override the target host:
TARGET_URL=http://other-host:5173 yarn workspace @code-dot-org/oceans-lab run test:ui
```

Test layout:

- `test/unit/**/*.test.{js,ts,jsx,tsx}` — vitest.
- `e2e/**/*.spec.ts` — Playwright. The `e2e/` dir is excluded from vitest
  via `vitest.config.ts`.

## Lint, typecheck, format

```bash
yarn turbo run lint     --filter=@code-dot-org/oceans-lab
yarn turbo run typecheck --filter=@code-dot-org/oceans-lab
yarn workspace @code-dot-org/oceans-lab run prettier:fix
yarn workspace @code-dot-org/oceans-lab run lint:fix
```

CI gates lint, typecheck, build, and unit tests. Run all four locally
before pushing.
