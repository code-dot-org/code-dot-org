<!--
Sync Impact Report
==================
Version: 1.0.0 (initial ratification)
Principles: 12 (4 non-negotiable, 8 engineering standards)
-->

# Code.org Platform Constitution

## Non-Negotiable Foundations

Amendments require engineering leadership and legal review.

### I. Approachable CS and AI Education for Every Learner
- Features MUST serve all CS learners, including pre-readers,
  young children on first computers, and advanced students 
  building full apps.
- When priorities conflict, the classroom experience wins.

### II. Privacy and Student Data Protection
- All code MUST comply with the Code.org Privacy Policy.
- Student emails: irreversible one-way hashes only.
- No birthdates; age only.
- No targeted advertising, no data sales, no third-party
  tracking on student-facing surfaces.
- Under-13: auto-moderate free text, block media sharing,
  first initial only on public projects.
- AI features MUST apply identical privacy constraints as
  all other student data.
- Student Records: retain and delete as school directs.
- Any spec introducing new data collection MUST include a
  "Privacy Review" section as a human-review gate.
- Review the privacy policy at https://code.org/en-US/privacy for clarifications.

### III. Equity, Access, and Accessibility
- WCAG 2.1 AA is a requirement, not a follow-up.
- Age-gating MUST enforce appropriate restrictions.
- UI code MUST address: RTL layout, low-bandwidth
  environments, intermittent connectivity.
- Code SHOULD work toward offline scenarios progressively.

### IV. Security-First
- Defend against OWASP Top 10 at all system boundaries.
- Never store secrets in source code. Actively check to ensure.
- Dependencies MUST be current; no known-vulnerable versions.
- Security review SHOULD accompany PRs introducing auth flows,
  data storage, third-party integrations, or public endpoints.

## Engineering Standards

Amendments follow normal PR process.

### V. Modular Architecture
- Backend domains: Rails Engines (`dashboard/engines/`).
- Frontend domains: Turborepo packages (`frontend/packages/`).
- New code in `apps/` MUST be TypeScript.
- Module boundaries MUST be justified by clear domain
  separation — premature extraction is as harmful as none.

### VI. Follow the Rails Way (`dashboard/`)
- Standard Rails directory layout, ActiveRecord, established
  auth/authz/serialization/job stack.
- Do not introduce parallel frameworks.
- API routes under `config/routes/api/`, namespaced
  `Api::V1::`.

### VII. TypeScript-First Frontend
- All new frontend code MUST be TypeScript.
- `frontend/`: no JS permitted; strict config required.
- `apps/`: convert JS to TS opportunistically when modified.
- React: functional components with hooks only; class
  components only when modifying existing legacy code.

### VIII. Test Every Behavior Change
- Every behavior-changing PR MUST include or update tests.
- New tests in `apps/` MUST use React Testing Library,
  not Enzyme.
- TypeScript in `apps/` MUST pass `yarn run typecheck`.
- Lint changed files before reporting success.

### IX. Open Source and Transparency
- Source code MUST remain in public GitHub repositories.
- Prefer open-source dependencies.
- External contributors MUST be able to set up the full
  stack without internal system access.

### X. Incremental Modernization
- Leave things better than found: tests, a11y, JS→TS.
- New labs MUST use Lab2.
- No wholesale rewrites without explicit approval.

### XI. Typed Backend/Frontend Contract
- API routes MUST be versioned (`/api/v1/`).
- New `frontend/` code MUST use `@code-dot-org/core` API
  client with schema-validated responses.
- Contracts MUST be explicit, typed, independently testable.

### XII. Simplicity and Maintainability
- Use native APIs, framework abstractions, and idiomatic
  library patterns — do not reimplement what the framework
  provides.
- Dependency preference: (1) built-in, (2) already installed,
  (3) new library with human approval.
- MUST include idiomatic doc comments: JSDoc for TS/JS,
  YARD for Ruby.
- Complexity MUST be justified by a concrete requirement.

## Constraints

- **Privacy Policy**: authoritative for data handling.
- **AGENTS.md** + directory READMEs: runtime conventions.
  Principles override conventions on conflict.
- **Design-system skill**: component library and migration.

## Governance

This constitution is the authoritative statement of engineering
principles. It supersedes ad-hoc conventions where they
conflict.

- **Amendments**: Propose via PR. State version bump rationale
  and token impact. Non-Negotiable Foundations require
  engineering leadership and legal review.
- **Versioning**: MAJOR = principle removal/redefinition.
  MINOR = new principle or material expansion.
  PATCH = clarification or wording fix.
- **Compliance**: PRs SHOULD verify against these principles.
  Violations MUST be justified in the plan's Complexity
  Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
