# devcontainer-integration

## ADDED Requirements

### Requirement: Spec-compliant devcontainer per persona
The system SHALL provide devcontainer definitions (compose-based) for each persona, consumable by VS Code, `@devcontainers/cli`, and devcontainer-native agent harnesses, using the same images and profiles as `bin/sandbox`.

#### Scenario: CLI up succeeds
- **WHEN** `npx @devcontainers/cli up --workspace-folder <sandbox worktree>` runs
- **THEN** the container starts with the workspace mounted, `remoteUser` mapped to uid 1000, and all services (mysqld, redis, and persona extras) answering

### Requirement: Service startup independent of ENTRYPOINT
Service startup SHALL live in a script invoked both by the image ENTRYPOINT (plain `docker run`) and by `postStartCommand` (devcontainer path), because the devcontainer CLI unconditionally replaces ENTRYPOINT and silently ignores an `entrypoint` key.

#### Scenario: Services up under the spec path
- **WHEN** the devcontainer CLI replaces the ENTRYPOINT with its keep-alive
- **THEN** `postStartCommand` still brings mysqld/redis up within 5 s of container start

### Requirement: Agent sandbox parity
An autonomous agent attached to a sandbox SHALL get the identical environment a human gets — same images, same zero-credential posture, same isolation — with no agent-specific image variant.

#### Scenario: Agent runs unattended safely
- **WHEN** an agent session executes arbitrary build/test/DB commands inside its sandbox
- **THEN** no AWS credential is reachable, no other sandbox is affected, and destroying the sandbox erases all effects

### Requirement: No bind mounts of the repo on macOS hosts
On macOS, the repo clone and worktrees SHALL live in VM-side named volumes; the devcontainer definitions SHALL NOT bind-mount the repository from the host filesystem.

#### Scenario: Mac editor session
- **WHEN** VS Code attaches to a sandbox on an Apple Silicon host
- **THEN** file operations occur on the container-side volume (verified by mount inspection), not across the host/VM boundary
