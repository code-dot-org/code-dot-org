# container-process-contract

## ADDED Requirements

### Requirement: Entrypoint performs one-shot prep then execs the command
The image SHALL provide a `bin/docker-entrypoint` that performs environment
fixup, runs database preparation only when the container command is the web
server, and ends with `exec "$@"`. It SHALL NOT remain the parent of the
application process.

#### Scenario: Web container prepares the database
- **WHEN** a container starts with the web server command
- **THEN** database preparation runs before the server, and the server
  process replaces the entrypoint via exec

#### Scenario: Worker container skips prep
- **WHEN** a container starts with the worker command
- **THEN** no database preparation runs and the worker starts directly;
  concurrent worker starts never race migrations

### Requirement: Web container runs puma in the foreground
The web container SHALL run exec-form
`["bundle", "exec", "puma", "-C", "config/puma.rb"]` with the working
directory at `dashboard/`. It SHALL NOT run `bin/dashboard-server`, `rerun`,
or any file watcher.

#### Scenario: Web process tree audited
- **WHEN** the web container is running and its process tree is inspected
- **THEN** puma is PID 1 (or the direct child of a kubelet-injected init)
  with no shell, rerun, or watcher ancestor

### Requirement: Worker container runs delayed_job with direct signal delivery
The worker container SHALL run exec-form
`["bundle", "exec", "bin/delayed_job", "run"]` with no shell wrapper, so
SIGTERM reaches the daemon.

#### Scenario: Pod eviction drains the current job
- **WHEN** the worker pod receives SIGTERM during job execution
- **THEN** delayed_job finishes the in-flight job and exits before
  `terminationGracePeriodSeconds` expires; the job is not hard-killed

### Requirement: Logging is tty-independent
Container stdout logging SHALL NOT require a tty. The dashboard pod spec
SHALL NOT set `tty: true`.

#### Scenario: Logs without a tty
- **WHEN** the web container runs with no tty allocated
- **THEN** request and application logs appear unbuffered on container
  stdout via `kubectl logs`

### Requirement: Both roles are observable by kubelet
The web Deployment SHALL keep its startup/readiness/liveness probes on
`/health_check`. The worker Deployment SHALL define a liveness probe (exec
probe on the delayed_job process) and a `terminationGracePeriodSeconds`
informed by max expected job runtime.

#### Scenario: Hung worker is restarted
- **WHEN** the delayed_job process dies but the container lingers
- **THEN** the exec liveness probe fails and kubelet restarts the container

#### Scenario: Web probes unchanged
- **WHEN** the web pod boots slowly
- **THEN** the startupProbe (failureThreshold 300 × 1s) absorbs the boot
  without a liveness kill

### Requirement: One image serves both roles
The web and worker Deployments SHALL use the same image and SHALL differ only
in command (and role-specific pod settings such as probes and grace period).

#### Scenario: Image digests compared
- **WHEN** the web and worker Deployments are inspected in one release
- **THEN** both reference the same image digest, differing only in command
  and role-specific pod spec fields
