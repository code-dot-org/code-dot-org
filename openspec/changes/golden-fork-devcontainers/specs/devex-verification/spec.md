# devex-verification

The DevEx contract, stated as budgets with automated verification. Budgets
derive from measured baselines (experiments A–G, H-B/C/D) with headroom;
tightening a budget requires a measurement, loosening one requires a design
review. The suite runs in CI against every candidate image set and locally
via `sandbox verify [--quick|--full]`.

## ADDED Requirements

### Requirement: Creation latency budget
Sandbox creation SHALL meet: DB answering ≤ 1.5 s from fork (measured 0.78–0.9 s); full `sandbox new` (fork + worktree + ports) ≤ 10 s (measured ~4 s); creation latency flat across 15 consecutive create/destroy cycles (no upward trend beyond 20%).

#### Scenario: Cold and repeated creation
- **WHEN** the verifier runs 15 create/destroy cycles and 6 simultaneous creations
- **THEN** every creation meets budget and the 6-way run shows no degradation versus solo

### Requirement: Rails persona edit-and-test loops
A rails sandbox SHALL meet: `rails console` to prompt ≤ 16 s; edit→changed-response through dev autoreload ≤ 15 s (measured 10.6–12.7 s; app-level ceiling until the Spring fix lands, then re-budget to ≤ 3 s); AR query round-trip after boot ≤ 5 ms; single test invocation overhead re-budgeted to ≤ 5 s once the preloader fix lands (current measured floor ~44 s is the app, not the sandbox — the suite SHALL track it to hold the fix accountable); a seeded level page serving 200 with `/blockly/*` assets ≤ 20 s from sandbox create.

#### Scenario: The TDD heartbeat is measured every run
- **WHEN** the verifier edits a controller, requests the page, and runs one lib test and one DB-touching model test
- **THEN** each step's wall time is recorded against budget and regressions fail the run

#### Scenario: Model test finds its reference data
- **WHEN** the DB-touching model test runs against the baked database
- **THEN** it does not fail for missing seeded reference tables (seed-completeness gate; `concepts` is the canary)

### Requirement: Frontend persona loop budgets
A frontend sandbox SHALL meet: `yarn install --immutable` on a fresh worktree ≤ 60 s with no yarn-cache network fetches (measured ~12 s); Vite HMR save→update ≤ 500 ms (measured 53–67 ms); vitest single-package re-run ≤ 5 s (measured 846 ms); Storybook ready ≤ 30 s (measured 11.3 s); warm turbo typecheck of one package ≤ 3 s (measured 0.5 s); Studio MSW dev server ready ≤ 45 s cold (measured ~40 s).

#### Scenario: Frontend loop verified offline
- **WHEN** the frontend loop checks run with `--network=none` (puppeteer/postinstall downloads pre-baked or skipped)
- **THEN** all budgets hold with zero network access

### Requirement: Apps persona budgets
An apps/fullstack sandbox SHALL meet: default dev-server variant ready ≤ 3 min; save→rebuild ≤ 90 s (webpack-bound; measured 22–60 s); jest single test warm ≤ 5 s; steady-state combo (rails + apps dev server) within the profile memory limit with ≥ 15% headroom; Vite-Rails integrated mode (`/frontend-studio/` through Rails) HMR ≤ 1 s and both dev servers serving concurrently.

#### Scenario: Memory budget enforced, not hoped
- **WHEN** the verifier brings up the full apps-persona combo under the profile's memory limit
- **THEN** no OOM kill occurs and peak RSS leaves the specified headroom

### Requirement: Staleness catch-up budgets
The system SHALL verify, weekly, the vacation scenario: fork a golden baked from a commit ≥ 21 days old, fast-forward to tip, and complete catch-up (bundle reconcile + migrate + incremental reseed) within 10 minutes with zero manual intervention; the reverse-skew case (worktree ≥ 21 days older than golden) SHALL either work or fail with a message directing the user to a dated golden tag.

#### Scenario: Three-week vacation
- **WHEN** the weekly staleness verifier replays 21+ days of real staging history onto an old golden
- **THEN** catch-up completes in budget, and any in-repo landmine that breaks it is reported as a product regression (the refresh must survive or name the offending commit)

#### Scenario: Interrupted catch-up resumes
- **WHEN** the catch-up is SIGKILLed mid-reseed and rerun
- **THEN** the rerun completes with no duplicate rows or errors (md5-guard resumability)

### Requirement: Isolation verification
Every suite run SHALL verify: DB writes in one sandbox invisible in another; no interleaved log lines across sandboxes; no pid-file collisions; distinct network namespaces (same internal ports, different host ports).

#### Scenario: Two sandboxes, adversarial workloads
- **WHEN** two sandboxes concurrently create tables, write logs, and run servers
- **THEN** all four isolation checks pass

### Requirement: Disposability under violence
The suite SHALL verify: kill -9 of mysqld mid-write, then `sandbox rm` and re-create → pristine state within creation budget; a multi-GB disk-fill inside a sandbox harms nothing outside it and is fully reclaimed by `rm`; zero leaked containers/volumes/images after every suite run (counts identical before/after).

#### Scenario: Violent churn leaves no trace
- **WHEN** the violence suite completes
- **THEN** docker resource counts and disk usage return to pre-suite baseline

### Requirement: Zero-credential and offline verification
Every suite run SHALL verify no AWS credential is readable inside any sandbox, no traffic to 169.254.169.254 is attempted, and the rails persona core loop (runner, console, one test) passes under `--network=none`.

#### Scenario: Credential probe
- **WHEN** the verifier scans env, filesystem, and IMDS reachability inside a sandbox
- **THEN** no credential material or metadata-service access exists

### Requirement: Download and size economics
The suite SHALL assert: a day with unchanged lockfiles/schema requires zero image bytes downloaded; `cdo-dev-base` ≤ 6 GB and `cdo-dev-db` ≤ 4 GB uncompressed; a golden refresh adds no persistent local growth beyond the replaced layer (30-cycle simulation stays within 2× the single-layer size).

#### Scenario: Quiet-day economics
- **WHEN** the verifier simulates a fetch-only day
- **THEN** no registry pull occurs and sandbox freshness still reflects the local refresh

### Requirement: First-run experience budget
On a machine with images pulled but no clone, first `sandbox new` (clone + worktree + fork) SHALL complete unattended in ≤ 20 minutes on a 100 Mbps connection, with progress reporting; every subsequent creation meets the normal ≤ 10 s budget.

#### Scenario: Fresh laptop
- **WHEN** first-run setup executes with no interactive prompts
- **THEN** it completes within budget and ends with a working sandbox serving a level page

### Requirement: Apple Silicon validation gate
Before team rollout, the full suite SHALL pass on a physical Apple Silicon Mac (Docker Desktop or OrbStack), with creation-latency and edit-loop budgets met at no worse than 2× the Linux reference numbers; results recorded as the platform baseline.

#### Scenario: M-series baseline run
- **WHEN** the suite runs on the reference Mac
- **THEN** all budgets pass at ≤ 2× Linux reference, or rollout is blocked with the specific failing angle named

### Requirement: Continuous regression gating and telemetry
The suite SHALL run in CI against every candidate image set (publish blocked on failure) and nightly against `latest`; `sandbox` commands SHALL record local timing telemetry (opt-out) so budget regressions in the field are detected, and a weekly dogfood-cohort survey during rollout SHALL capture subjective DevEx alongside the numbers.

#### Scenario: Candidate image regresses creation latency
- **WHEN** a candidate image set fails any budget in CI
- **THEN** it is not published and the failing angle, measured value, and budget are reported
