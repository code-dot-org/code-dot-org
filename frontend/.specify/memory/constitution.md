# Code.org Learning Platform Frontend Constitution

## Core Principles

### I. Package-First

Every significant capability MUST be implemented as a standalone package under
`frontend/packages/` (or `frontend/packages/labs/`). Packages MUST be self-contained,
independently buildable, and independently testable. A package with no clear bounded
purpose MUST NOT be created solely for organizational convenience.

Host Applications are the root `apps/` (webpack 5 React app) and `frontend/apps/studio`
(Vite/Code Studio). Both consume packages from this workspace.

**Labs** (e.g. `@code-dot-org/music-lab`) are a distinct subtype stored under
`frontend/packages/labs/` and differ from standard packages as follows:

| | Standard packages | Labs |
|---|---|---|
| **Exports** | Multiple granular named entry points | Single root `App` component (`src/App.tsx`) |
| **Consumption** | Granular module imports | Embedded as a single App in a Host Application |
| **Dev server** | Optional | Required — must run standalone at `localhost-studio.code.org` |
| **`preview` script** | Not required | Required — validates production build in isolation |
| **Testing** | Vitest unit tests | Vitest unit tests + UI tests independent of host and backend |
| **Publishing** | May be published to npm | Not published; private to the monorepo |

Labs MUST be developable and verifiable without the full Host Application or backend.

See [package-conventions.md](package-conventions.md) for concrete rules.

**Rationale**: Packages are consumed by both host apps. Explicit exports and externalized
peers prevent duplicate bundling across webpack and Vite consumers. Turborepo enforces
correct build order and enables remote caching.

### II. TypeScript-First

All new source files MUST be written in TypeScript (`.ts` / `.tsx`). `any` MUST NOT be
used without an inline justification comment. The project MUST pass `yarn typecheck`
before any PR merges.

See [package-conventions.md](package-conventions.md) §6 for the required split-tsconfig
structure and permitted exceptions.

**Rationale**: Consistent tsconfig structure ensures `vite-plugin-dts` generates correct
declaration files and cross-package type checking is reliable.

### III. Consistent Tooling

Every package MUST use identical tooling scaffolding so that `turbo run <task>` behaves
uniformly across the monorepo. No package MAY substitute alternative build, lint, or
format tools without documented justification and team approval.

See [package-conventions.md](package-conventions.md) §2, §3, §7, §8, §9, §11 for
required scripts, formatting config, Vite build setup, ESLint config, lint-staged config,
and `.gitignore`.

**Rationale**: Uniform tooling means any engineer can work in any package without
relearning the setup.

### IV. Test Coverage

Unit tests MUST be written for all non-trivial logic. A PR that adds or changes logic
MUST include or update corresponding tests that pass locally before submission. Labs
additionally require UI tests that run independently of the Host Application and backend.

See [package-conventions.md](package-conventions.md) §10 for test framework requirements,
co-location conventions, visual snapshot testing, and the UI test constraint for labs.

**Rationale**: Shared packages have wide blast radius across student and teacher surfaces.
Full CI (drone) takes 30–60 minutes; local test runs are the primary fast-feedback gate.

### V. Accessibility and Design System Compliance

All UI components MUST meet WCAG 2.1 AA accessibility standards. New UI work MUST use
`@code-dot-org/component-library` where an appropriate component exists. Custom components
that bypass the design system MUST document why. All public design system components MUST
have Storybook stories. The `jsx-a11y` rules provided by `eslint/react.mjs` MUST remain
enabled and MUST NOT be suppressed without a documented reason.

**Rationale**: Code.org's mission is CS education for *all* kids — accessibility is
non-negotiable. The design system enforces visual consistency and reduces duplicated effort.

### VI. Observability

Production-facing packages MUST emit structured, actionable telemetry via
`@code-dot-org/observability` — not ad-hoc instrumentation. New performance-sensitive
features MUST define measurable success criteria (e.g., p95 latency targets) before
implementation. Log events MUST NOT include PII and MUST use a `<namespace>/<event>`
naming convention.

**Rationale**: The platform cannot improve what it cannot measure. Centralizing through a
shared package ensures consistent event schemas, prevents duplicate SDKs, and simplifies
compliance review.

### VII. Documentation

Every package MUST be documented such that a new engineer can understand its purpose,
install it, and use its exports without reading the source. Labs additionally MUST document
how to run standalone and how to run UI tests independently.

See [package-conventions.md](package-conventions.md) §13 for required README contents
and the CONTRIBUTING.md expectation.

**Rationale**: Packages are consumed across both host apps by engineers unfamiliar with
each package's internals. Good docs reduce ramp-up time and prevent misuse.

## Development Workflow

- **Stack**: TypeScript 5.x + React 18+, Vite (library mode), Vitest, Turborepo, Yarn
  (via Corepack). `npm install` MUST NOT be used.
- **Commit messages**: Conventional Commits format, Airbnb style — a `type(scope): subject`
  header (72 char max), followed by a blank line, a short prose description, then bullets
  for details:
  ```
  feat(music-lab): add button color customization

  Allows the play button color to be configured via lab props.

  - Add `buttonColor` prop to PlayButton component
  - Update MusicLab App to pass color through to controls
  - Add Vitest coverage for color prop rendering
  ```
- **Branching**: Feature branches target `staging`; names follow `<owner>/<short-description>`.
- **Pre-PR gate**: `yarn typecheck && yarn lint && yarn test && yarn build` MUST pass locally.
- **Code review**: All PRs MUST have at least one approval.
- **Spec-driven features**: Non-trivial features MUST begin with `/speckit.specify` before
  implementation. Spec artifacts live in `specs/<###-feature-name>/`.
- **No force-push to `staging`**: protected branch; use PRs only.

## Governance

This constitution supersedes all other informal practices for the `frontend/` workspace.
Where it conflicts with top-level `AGENTS.md`, this document takes precedence for
frontend-only concerns.

**Conventions reference**: Read [package-conventions.md](package-conventions.md) in full
when creating a new package or modifying any package root-level file.

**Amendment procedure**: Propose changes via PR. The description MUST identify the
affected principle, the version bump type, and the motivation. At least one other engineer
MUST approve. After merge, update `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION`:
- MAJOR: principle removed, redefined, or governance fundamentally altered
- MINOR: new principle or mandatory section added
- PATCH: clarifications, wording, typo fixes

**Compliance review**: PR authors verify compliance. Reviewers SHOULD call out violations.
Deviations MUST be justified in the PR description and tracked in the plan's Complexity
Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
