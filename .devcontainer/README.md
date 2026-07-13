# Devcontainer Quick Start

Faster alternative to [SETUP.md](../SETUP.md) for getting a working dev
environment using Docker. Everything happens inside the container — git,
tests, debugging, commits, dev servers.

## Prerequisites

- Docker Engine + Docker Compose v2.23+ ([install](https://docs.docker.com/engine/install/))
- git-lfs (`git lfs install`)
- VS Code with "Dev Containers" extension (optional)

## How it works

The repo lives in a Docker volume (a full `git clone`, not a host bind-mount).
On first use, `initializeCommand` clones the repo from your local checkout
into the volume (~2 min, one-time). After that, the volume persists across
container restarts. All your work (edits, commits, branches) happens inside
the container where git, Ruby, Node, and all tools are available.

## First-time image build

Images are not published yet — build locally once:

```shell
git clone git@github.com:code-dot-org/code-dot-org.git
cd code-dot-org
git lfs pull

# Frontend-only devs: build the slim image (~3 min, ~2.5 GB)
docker build -f .devcontainer/Dockerfile.frontend -t cdo-dev-frontend:latest .

# Rails/fullstack devs: build the full image (~10 min, ~5 GB)
docker build -f .devcontainer/Dockerfile.base -t cdo-dev-base:latest .

# Rails/fullstack devs: build the seeded DB (~20 min first time)
.devcontainer/scripts/bake-db.sh
docker build -f .devcontainer/Dockerfile.db -t cdo-dev-db:latest .
```

Frontend-mock only needs `cdo-dev-frontend`. All other profiles need `cdo-dev-base` + `cdo-dev-db`.

## Persona selection

Five named configurations in `.devcontainer/`:

| Directory | Services | Startup | Who it's for |
|-----------|----------|---------|--------------|
| `frontend-mock/` | Node only | ~5s | Fast standalone package dev (oceans, ailab, markdown, component-library) |
| `frontend/` | Node + DB + Redis + Rails | ~15s | Frontend devs who need real Rails API endpoints |
| `rails/` | Ruby + DB + Redis | ~15s | Backend/Rails developers |
| `fullstack/` | Everything + apps S3 download | ~2 min | Legacy apps/ work, cross-stack, level page rendering |

**Which one do I pick?**
- Editing a standalone package (oceans, markdown, etc.) with mocked APIs? -> `frontend-mock/`
- Working in `frontend/` and need real Rails API endpoints? -> `frontend/`
- Working in `dashboard/` (Rails models, controllers, API)? -> `rails/`
- Working in `apps/` or need full level pages? -> `fullstack/`

**Frontend dev workflow progression** (fast -> slow):
1. Start in `frontend-mock/` -- edit package, vitest, Storybook (seconds per iteration)
2. Verify in Studio MSW mode -- `yarn dev`, visit `/frontend-studio/` routes
3. Switch to `frontend/` -- start Rails (`bin/dashboard-server`), verify against real APIs
4. Run Playwright e2e if applicable

## VS Code: Reopen in Container

1. Open the repo in VS Code
2. Command Palette → "Dev Containers: Reopen in Container"
3. Pick **rails**, **frontend**, or **fullstack** from the dropdown
4. First time takes ~2 min (clones repo into a Docker volume)
5. Inside the terminal: `bin/dashboard-server` (rails) or `yarn dev` (frontend)
6. Open the forwarded port shown in VS Code's Ports tab

Everything runs inside the container: `git commit`, `bundle exec`, `yarn test`,
`rails console`, debugging with `binding.irb` or `pry` — all work.

## CLI: `devcontainer` or `bin/sandbox`

Single instance (same as VS Code, no wrapper needed):

```shell
devcontainer up --workspace-folder . --config .devcontainer/rails/devcontainer.json
devcontainer exec --workspace-folder . bash
```

Multiple parallel instances (agents, branches):

```shell
bin/sandbox new feature-a --rails
bin/sandbox new feature-b --frontend
bin/sandbox exec feature-a bash
bin/sandbox rm feature-a
```

## Development workflows inside the container

### Rails
```shell
bundle exec rake db:setup_or_migrate  # First-time DB bootstrap (NOT db:migrate from empty)
bin/dashboard-server                  # Start Rails on port 3000
bundle exec rails console            # IRB with app loaded
bundle exec rails runner "puts Unit.count"
bin/spring testunit test/models/concept_test.rb
bundle exec rake db:migrate          # Apply pending migrations (after first bootstrap)
mysql -h db -uroot -ppassword        # Direct DB access
redis-cli -h redis ping              # Redis check
```

### Frontend (Vite)
```shell
cd frontend
yarn install && yarn dev          # Studio at http://localhost:3036/frontend-studio/
yarn turbo run test               # vitest
yarn turbo run typecheck          # TypeScript
```

### Apps (legacy webpack)
```shell
cd apps
yarn install && yarn build        # Build required once before tests
yarn test:unit test/unit/gridUtilsTest.js
yarn start:cheapest               # Dev server at http://localhost:9000
```

### Git (inside the container)
```shell
git checkout -b my-feature
# ... edit, test ...
git add -A && git commit -m "my change"    # pre-commit hook runs (Ruby available)

# To push, set up credentials first (one-time):
git remote set-url origin git@github.com:code-dot-org/code-dot-org.git
# Then either forward your SSH agent or use gh auth:
#   Option A: SSH agent forwarding (add to devcontainer.json: "mounts": ["source=${localEnv:SSH_AUTH_SOCK},target=/ssh-agent,type=bind"])
#   Option B: gh auth login (inside the container)
git push origin my-feature
```

### Database GUI tools
MySQL is forwarded to the host on port 3306. Connect TablePlus/DBeaver to
`localhost:3306` with user `root`, password `password`.

## Known limitations

- 528 encrypted levels render hollow (no `properties_encryption_key`)
- MinIO buckets start empty (lazy-populate on first asset touch)
- Apps S3 package download requires the commit to have been built by CI

## Related docs

- [SETUP.md](../SETUP.md) — native install (the fallback)
- [docker/developers/README.md](../docker/developers/README.md) — services-only sidecar
- [apps/README.md](../apps/README.md) — legacy frontend build/test
- [frontend/AGENTS.md](../frontend/AGENTS.md) — modern frontend conventions
