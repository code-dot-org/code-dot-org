# k8s-secrets-lifecycle

## ADDED Requirements

### Requirement: Secret changes reach running pods
The dashboard and activejob-worker Deployments SHALL carry Reloader
annotations naming `cdo-external-secrets` explicitly (annotations strategy,
not `auto`), so that a change to the Secret's data triggers a rolling
restart of exactly those workloads.

#### Scenario: SM edit propagates without manual action
- **WHEN** a key under `{env}/cdo/*` changes in AWS Secrets Manager and ESO
  syncs `cdo-external-secrets`
- **THEN** the annotated Deployments roll within one refresh interval plus
  rollout time, and new pods see the new value in `CDO_*` ENV

#### Scenario: Unrelated Secret change is ignored
- **WHEN** a Secret not on the watch list changes in the namespace
- **THEN** no annotated Deployment restarts

### Requirement: Database credential rotation is zero-downtime
MySQL credentials SHALL rotate via AWS SM alternating-users rotation: the
previous credential MUST remain valid until every pod consuming it has been
replaced by the rolling restart.

#### Scenario: Rotation under load
- **WHEN** the MySQL secret rotates while the fleet serves traffic
- **THEN** pods not yet restarted keep authenticating with the old
  credential, restarted pods use the new one, and no request fails for lack
  of a valid credential

### Requirement: Secret keys are valid environment variable names
Every AWS SM key destined for `cdo-external-secrets` SHALL match
`[A-Za-z_][A-Za-z0-9_]*`. CI validation MUST fail before deploy on any key
that `envFrom` would silently drop.

#### Scenario: Invalid key rejected in CI
- **WHEN** a key containing e.g. `-` or `.` is added to `{env}/cdo/*`
- **THEN** the validate workflow fails naming the offending key, before any
  pod silently boots without it

### Requirement: One canonical secret path per workload class
`k8s/docs/kubernetes-secrets.md` SHALL state the rule: k8s-deployed
workloads consume secrets as ESO-synced `CDO_*` env vars; runtime lazy
fetches (`!Secret`/`!StackSecret` via `lib/cdo/secrets_config.rb`) are
reserved for stack-scoped `CfnStack/*` secrets on EC2.

#### Scenario: New secret added for a k8s workload
- **WHEN** an engineer adds a secret consumed by a k8s-deployed process
- **THEN** the documented rule directs it into `{env}/cdo/*` for ESO sync,
  not a `!Secret` tag

### Requirement: Secrets stay out of crash payloads
Exception reporters (Honeybadger) SHALL scrub ENV from crash payloads: no
report leaving the pod MAY contain `CDO_*` values.

#### Scenario: Unhandled exception reported
- **WHEN** an unhandled exception is reported from a pod whose ENV contains
  `CDO_*` secrets
- **THEN** the delivered payload contains no `CDO_*` variable values

### Requirement: Service link injection stays disabled
Pod specs consuming `CDO_*` env config SHALL set
`enableServiceLinks: false`, with the rationale documented: `lib/cdo.rb`
enumerates ENV by `CDO_` prefix, so a Service named `cdo-*` would inject
`CDO_*_SERVICE_HOST` vars into the config namespace.

#### Scenario: cdo-prefixed Service in namespace
- **WHEN** a Service named `cdo-*` exists in the pod's namespace
- **THEN** no `CDO_*_SERVICE_*` variables appear in the pod's ENV or in
  parsed CDO config
