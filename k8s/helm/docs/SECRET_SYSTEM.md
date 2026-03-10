# Dashboard Secret System

## What Changed

`dashboard` still resolves config in this order:

`ENV` > `locals.yml` > `globals.yml` > `*.yml.erb`

In Kubernetes, we are intentionally using that same model:

- scalar secret overrides come in as `CDO_*` env vars
- non-secret topology/config values still come from `locals.yml`
- some structured values still fit `locals.yml` better than env vars

So the real change is not the `CDO` rules. The change is the delivery path:

- Helm creates or references Kubernetes objects
- those objects feed config and secrets into the dashboard pod
- `CDO` then reads them using the same precedence rules it always has

## New Terms

- `pod`: the Kubernetes unit that runs the `dashboard` service, roughly like a Docker container
- `Secret`: a Kubernetes key/value object for secret data
- `ConfigMap`: the non-secret equivalent, used here for the generated `locals.yml`
- `Helm`: the templating/deploy tool that generates this chart’s Kubernetes resources
- `ESO`: External Secrets Operator, which copies secrets from AWS Secrets Manager into Kubernetes
- `envFrom`: a pod feature that turns all keys in a Kubernetes `Secret` into environment variables

## Tracing A Secret From AWS Secrets Manager To A Dashboard Pod

Use `staging/cdo/db_writer` as the concrete example.

1. The secret exists in AWS Secrets Manager as `staging/cdo/db_writer`.
2. In the `staging` Kubernetes namespace, ESO is configured with a namespace-scoped `SecretStore` named `aws-secrets-manager-store`.
3. That `SecretStore` uses a dedicated Kubernetes service account for staging, tied to AWS via IRSA.
4. The AWS IAM role for that service account is scoped to:
   - `staging/cdo/*`
   - `CfnStack/staging/*`
   - only the `AWSCURRENT` version stage
5. The chart’s `ExternalSecret` syncs matching AWS secrets into Kubernetes `Secret/cdo-secrets`.
6. The intended next step is for the dashboard pod to import `cdo-secrets` with `envFrom`.
7. When that happens, the `db_writer` key will become `CDO_db_writer` inside the pod.
8. `CDO` reads `ENV` first, so that value will win over `locals.yml`, `globals.yml`, and the `*.yml.erb` defaults.

The local/dev counterpart works the same way in shape:

- `cdo-secrets-local` is a bulk Kubernetes `Secret`
- it is Helm-managed instead of AWS-backed
- the dashboard pod already imports it with `envFrom`
- its keys become `CDO_*` environment variables in the pod

### A Note On Storage And Encryption

- the source secret in AWS Secrets Manager is encrypted at rest there
- after sync, the value is also stored in a Kubernetes `Secret` object, not just transiently in process memory
- this doc does not claim a specific cluster-secret-encryption-at-rest implementation unless that is documented elsewhere

## The Two Bulk Secret Layers

The current and intended model is that dashboard pods get secrets from bulk Kubernetes `Secret` layers, not one AWS API call per secret at runtime.

### `cdo-secrets-local`

`cdo-secrets-local` is the current local/deploy-specific secret layer.

- Helm-managed
- local/dev/adhoc-like or deploy-specific values
- already wired into the dashboard pod
- imported with `envFrom` and `prefix: CDO_`

Because `CDO_*` env vars are highest-priority input to `CDO`, this layer currently wins over:

- `locals.yml`
- `globals.yml`
- `config/[env].yml.erb`
- `config.yml.erb`

### `cdo-secrets`

`cdo-secrets` is the AWS-backed bulk secret layer.

- ESO-managed
- syncs `<namespace>/cdo/*` from AWS Secrets Manager into Kubernetes
- intended next shared/global layer for pod-level `envFrom`

That direction is important, but it is not yet wired into the dashboard pod today.

### Possible Future Naming

We may later organize this more explicitly as:

- `cdo-secrets-local`
- `cdo-secrets-global`

That is a likely future naming direction, not current behavior.

## Staging Namespace Security Boundary

The important practical security story for `staging` is:

- `staging` does not get blanket read access to all secrets
- it gets a namespace-scoped `SecretStore`
- ESO in `staging` uses a dedicated service account
- that service account assumes a dedicated AWS IAM role via IRSA
- that IAM role can only read:
  - `staging/cdo/*`
  - `CfnStack/staging/*`
  - `AWSCURRENT`

So the staging namespace is meant to read staging secrets, not arbitrary production/test/etc secrets.

## How This Fits The Existing `CDO` System

The Kubernetes story is deliberately mapped onto the familiar `CDO` precedence model:

`ENV` > `locals.yml` > `globals.yml` > `*.yml.erb`

That means:

- `CDO_*` env vars still win
- this is why `envFrom` is currently the main bridge
- `locals.yml` still matters for non-secret config
- `config.yml.erb` still defines which keys are valid

This works especially well for scalar values such as:

- `db_writer`
- `db_reader`
- `redis_url`
- `aws_s3_secret_access_key`

It is awkward for structured values such as:

- `netsim_redis_groups`

because `envFrom` injects strings, not nested Ruby `Hash`/`Array` values.

So the practical split is:

- use `CDO_*` env vars for scalar secret overrides from Kubernetes
- use `locals.yml` for non-secret topology/config values
- keep `config.yml.erb` as the source of truth for valid keys

## What Still Lives In `locals.yml`

`locals.yml` is still the right place for non-secret values and topology details.

In the current Helm chart, that includes values like:

- `db_cluster_id`
- `db_endpoint_*`
- `db_endpoint_*_port`
- `aws_s3_endpoint`
- `aws_s3_emulated`

The chart still mounts a generated `locals.yml` `ConfigMap` into the dashboard pod at `/code-dot-org/locals.yml`.

That means the current Helm structure is:

- secrets in Kubernetes `Secret` objects
- non-secrets in the generated `locals.yml` `ConfigMap`

One important rule still applies: `config.yml.erb` remains the source of truth for valid `CDO.*` keys. If Helm writes a key into `locals.yml` or `CDO_*` env that does not exist in [config.yml.erb](/Users/seth/src/code-dot-org/config.yml.erb), startup fails unless the unknown-property check is disabled.

## Current Gaps / Not Yet Implemented

The current K8s story is improved, but still incomplete.

### Implemented

- `cdo-secrets-local` exists and is Helm-managed
- the dashboard pod imports `cdo-secrets-local` via `envFrom` with `prefix: CDO_`
- `locals.yml` is still mounted from a `ConfigMap` for non-secret values
- ESO can sync `<namespace>/cdo/*` into Kubernetes `Secret/cdo-secrets`

### Not Yet Implemented End-To-End

- `cdo-secrets` is not yet wired into the dashboard pod
- `lib/cdo/k8s_secrets.rb` is still a stub
- `lib/cdo/secrets_config.rb` can switch toward a K8s backend, but that path is not ready
- the active Kubernetes bridge today is pod-level env injection, not in-app K8s secret resolution

## Exact `CDO` Resolution Order

The effective `CDO` config and secret resolution order is:

`ENV` > `locals.yml` > `globals.yml` > `*.yml.erb`

In concrete terms, the loader processes sources in this priority order:

1. `ENV`
2. `locals.yml`
3. `globals.yml`
4. `config/[env].yml.erb`
5. `config.yml.erb`

The first value seen for a key wins. Later sources provide defaults, not overrides.

That means all of these are true:

- `CDO_FOO=bar` beats `locals.yml`
- `locals.yml` beats `globals.yml`
- `locals.yml` beats `config/development.yml.erb`
- `locals.yml` beats `config.yml.erb`
- a plain value in `ENV`, `locals.yml`, or `globals.yml` beats a later `!Secret` or `!StackSecret`

## `config.yml.erb`, `!Secret`, And `!StackSecret`

At runtime, `CDO.*` configuration is built from three mechanisms:

1. plain config values in version-controlled YAML/ERB
2. direct overrides from `locals.yml`, `globals.yml`, or `CDO_*` env vars
3. lazy secret references using `!Secret` and `!StackSecret`

[config.yml.erb](/Users/seth/src/code-dot-org/config.yml.erb) is the source of truth for the available `CDO.*` keys.

Most keys are plain values, but some are tagged:

- `!Secret`
- `!StackSecret`

These tags do not contain the final value themselves. They create placeholder objects during config render via [lib/cdo/secrets_config.rb](/Users/seth/src/code-dot-org/lib/cdo/secrets_config.rb).

Later, when the application first reads `CDO.some_key`, the placeholder resolves to a real secret value.

An important nuance: only placeholder objects that survive the final merge are ever resolved. If a higher-priority source already set a plain value for that key, the later `!Secret` or `!StackSecret` never takes effect.

### Reverse-Merge Behavior

`CDO` loads higher-priority sources first, then merges later sources with reverse-merge semantics in [lib/cdo/config.rb](/Users/seth/src/code-dot-org/lib/cdo/config.rb), which keeps the existing value and ignores the later one on conflicts.

So if:

- `locals.yml` says `someval: "I am overriding this"`
- `config.yml.erb` later says `someval: !Secret`

then `CDO.someval` resolves to the literal value from `locals.yml`, not to AWS Secrets Manager.

### `locals.yml` Can Promote A Key Into `!Secret`

The reverse is also true: a higher-priority source can turn a plain config key into a secret-backed value by setting it to `!Secret` or `!StackSecret`.

For example, if [config.yml.erb](/Users/seth/src/code-dot-org/config.yml.erb) contains:

```yml
boo: "fixed string here"
```

then `locals.yml` can promote it into a secret lookup with:

```yml
boo: !Secret
```

Under a real Rails boot, `CDO.boo` then resolves through the normal secret lookup path instead of returning the plain string default.

This was verified directly with `rails runner`.

## AWS Secret Resolution Details

Today the implemented `!Secret` path is AWS Secrets Manager lookup through [lib/cdo/secrets.rb](/Users/seth/src/code-dot-org/lib/cdo/secrets.rb).

For `foo: !Secret`, the app resolves:

- `staging/cdo/foo` in staging
- `production/cdo/foo` in production
- `adhoc/cdo/foo` in adhoc
- etc.

This naming convention is produced by `Cdo::SecretsConfig.secret_path(prefix, key)`, which returns:

`<env>/cdo/<key>`

Important behavior:

- secret fetches are lazy by default
- fetched values are cached in memory
- secret values may be JSON; if so they are parsed into a `Hash` or `Array`
- some environments clear most secret references by default via `clear_secrets`; see [config/secrets.md](/Users/seth/src/code-dot-org/config/secrets.md)

### `!StackSecret`

`!StackSecret` is the stack-specific override mechanism.

Lookup order is:

1. `CfnStack/<stack-name>/<key>`
2. fallback to `<env>/cdo/<key>`

That logic also lives in [lib/cdo/secrets_config.rb](/Users/seth/src/code-dot-org/lib/cdo/secrets_config.rb).

This lets one deployment override a secret that would otherwise be shared by all deployments of the same environment type.

## AWS / ESO Implementation Details

The EKS addon setup installs External Secrets Operator CRDs and then creates AWS-backed secret stores.

Relevant files:

- [k8s/tofu/codeai-k8s/eks-cluster/external-secrets-operator.tf](/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/eks-cluster/external-secrets-operator.tf)
- [k8s/tofu/codeai-k8s/eks-cluster-addons/external-secrets-operator-config.tf](/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/eks-cluster-addons/external-secrets-operator-config.tf)
- [k8s/tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/main.tf](/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/main.tf)
- [k8s/tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/iam.tf](/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/iam.tf)

For single-namespace environments, this creates:

- a namespace-scoped `SecretStore` named `aws-secrets-manager-store`
- a dedicated per-environment Kubernetes service account
- a dedicated per-environment AWS IAM role used via IRSA

The chart-side ESO integration lives in [k8s/helm/templates/aws-secrets-manager.yaml](/Users/seth/src/code-dot-org/k8s/helm/templates/aws-secrets-manager.yaml).

When `use_aws_secrets_manager: true`, it creates an `ExternalSecret` that:

- reads from `SecretStore/aws-secrets-manager-store`
- finds all AWS secrets under `<namespace>/cdo`
- writes them into one Kubernetes `Secret` named `cdo-secrets`

So in `staging`, the intended sync scope is:

- `staging/cdo/*` from AWS Secrets Manager

and the result is:

- `Secret/cdo-secrets`

This is a bulk sync model: ESO materializes many AWS secrets into one Kubernetes secret which is intended to become a pod-level env layer, not just a secret backend for Ruby to query directly.
