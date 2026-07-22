# skaffold-dashboard-profile

## ADDED Requirements

### Requirement: Full dashboard is an additive layer
The full Rails app deployment SHALL be expressed as a profile (or overlay /
values layer) that adds to the backend base: it adds the frontend build to
the image pipeline and adds the cdo-dashboard Deployment, Service, and
Ingress to the manifests. It MUST NOT restate or fork backend-base
configuration that it does not change.

#### Scenario: Dashboard profile renders base plus dashboard
- **WHEN** the dashboard profile is rendered
- **THEN** the output contains everything the backend base renders, plus the
  cdo-dashboard Deployment, Service, and Ingress and the fully built
  frontend assets in the deployed image

#### Scenario: Base change propagates
- **WHEN** a resource or value in the backend base changes (e.g. a locals
  key or a service definition)
- **THEN** the dashboard profile picks up the change without a parallel edit
  to dashboard-layer files

### Requirement: Full app is an explicit opt-in
The full dashboard SHALL require explicitly naming the dashboard profile
(`skaffold dev -p dashboard`); bare `skaffold dev` deploys the backend-only
base. The full-app invocation MUST remain a single documented command with
existing port-forwards (dashboard HTTP and HMR) intact.

#### Scenario: Full-app local dev
- **WHEN** a developer runs `skaffold dev -p dashboard`
- **THEN** the dashboard is reachable on the documented forwarded ports with
  frontend assets served

#### Scenario: Bare dev is backend-only
- **WHEN** a developer runs `skaffold dev` with no profile flags
- **THEN** the backend-only base deploys, with no dashboard resources and no
  frontend build

### Requirement: activejob-only profile is superseded, not duplicated
The `activejob-only` profile SHALL NOT survive as a subtraction layer. It is
either removed in favor of the backend base or retained as a thin alias of
it; the deletion patches in `k8s/kustomize/overlays/activejob-only/` and the
`dashboard.enabled: false` role of `k8s/helm/activejob-only.values.yaml`
MUST be removed.

#### Scenario: Old invocation is redirected
- **WHEN** a developer runs the documented replacement for
  `skaffold dev -p activejob-only` (bare `skaffold dev`)
- **THEN** they get the backend-only deployment via the base layering, with
  no deletion patches involved
