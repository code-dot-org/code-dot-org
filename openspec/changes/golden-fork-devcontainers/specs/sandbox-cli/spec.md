# sandbox-cli

## ADDED Requirements

### Requirement: Sandbox lifecycle commands
The system SHALL provide `bin/sandbox` with subcommands `new <name> [--persona]`, `rm <name>`, `ls`, `refresh`, `snapshot <name>`, and `gc`. `new` SHALL fork the local golden (compose: app + db + redis), create a git worktree for the sandbox off the machine's clone, apply the persona profile, and print connection details (forwarded ports, worktree path, attach command).

#### Scenario: New sandbox within budget
- **WHEN** the repo clone exists and golden is current
- **THEN** `sandbox new` completes — DB answering, worktree checked out, ports published — in ≤ 10 s

#### Scenario: Destroy is total
- **WHEN** `sandbox rm` runs against a sandbox with uncommitted DB mutations and dirty container layers
- **THEN** all containers, the worktree (after a dirty-tree warning requiring confirmation), and per-sandbox volumes are removed and their disk reclaimed

### Requirement: Persona profiles
`new` SHALL support profiles with curated defaults: `--rails` (app+db+redis+minio with pre-created buckets, prebuilt apps static bundle available so level pages render); `--frontend` (node image, MSW mode default, no Rails services); `--apps` and `--fullstack` (full stack; apps dev server default variant `start:cheapest`, container memory limit ≥ 12 GB, `fs.inotify.max_user_watches ≥ 524288`, `/etc/hosts` entry `127.0.0.1 localhost-studio.code.org`).

#### Scenario: Rails persona serves real pages
- **WHEN** a `--rails` sandbox is created and a seeded level page is requested
- **THEN** the page returns 200 with its `/blockly/*` assets and no S3-related 500s

#### Scenario: Frontend persona needs no Rails
- **WHEN** a `--frontend` sandbox is created
- **THEN** no MySQL/Redis containers run, and `VITE_API_MODE=msw yarn dev` serves Studio standalone

#### Scenario: Apps persona survives its memory budget
- **WHEN** an `--apps` sandbox runs Rails plus the default apps dev-server variant
- **THEN** the container operates within its configured memory limit without OOM

### Requirement: Per-sandbox runtime isolation
Every sandbox SHALL have isolated: database (own mysqld on a CoW fork), network namespace (internal ports 3000/3306/6379 identical across sandboxes; host ports auto-assigned), and — whenever a shared tree could be mounted by more than one container — tmpfs shadow-mounts over `dashboard/tmp` and `dashboard/log`.

#### Scenario: Parallel sandboxes do not interact
- **WHEN** two sandboxes run simultaneously and one mutates its DB, writes logs, and starts a rails server
- **THEN** the other sandbox observes none of it: no DB rows, no interleaved log lines, no pid-file collision

### Requirement: Worktree and LFS correctness
The CLI SHALL own git mechanics: verify `git-lfs` is installed before any checkout (hard error with install guidance if absent), keep clone and worktrees in one volume so worktree pointer files resolve, smudge LFS from the local store without network where possible, and treat each worktree as single-container-writable.

#### Scenario: Missing git-lfs
- **WHEN** `sandbox new` runs on a machine without the git-lfs binary
- **THEN** it fails before creating anything, naming the missing binary and how to install it

### Requirement: Sandbox DB fork start protocol
Forked DB containers SHALL start with the WAL shim (copy redo/undo to tmpfs, whiteout the originals) and dev-durability flags (`--skip-log-bin --mysqlx=OFF --innodb-flush-log-at-trx-commit=0 --skip-innodb-doublewrite`, bounded buffer pool).

#### Scenario: Writable-layer growth bounded
- **WHEN** a sandbox performs a 10k-row write workload
- **THEN** its container writable layer grows by less than 150 MB

### Requirement: Snapshot to personal golden
`sandbox snapshot` SHALL capture a sandbox's current DB state as a personal golden image the user can fork later, completing in ≤ 30 s, after a clean in-container mysqld shutdown and restart.

#### Scenario: Crafted state survives sandbox death
- **WHEN** a user snapshots a sandbox containing hand-crafted records, destroys it, and forks the snapshot
- **THEN** the new sandbox contains those records

### Requirement: Catch-up inside a long-lived sandbox
The CLI SHALL provide an in-sandbox catch-up (`sandbox update <name>`) running migrate + incremental reseed + bundle check inside that sandbox only, preserving its local mutations.

#### Scenario: Week-old sandbox catches up
- **WHEN** `update` runs in a sandbox whose golden was a week old
- **THEN** pending migrations apply, changed curriculum reseeds incrementally, hand-made mutations remain, and the operation is resumable if interrupted
