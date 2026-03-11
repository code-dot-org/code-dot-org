# Dashboard Secrets in Kubernetes

## Tracing A Secret From AWS Secrets Manager To A Dashboard Kubernetes Pod

Lets say we want to fetch `staging/cdo/db_writer` from our dashboard pod (aka "container")

1. In AWS Secrets Manager we have: `staging/cdo/db_writer` ([`config.yml.erb`](../../../config.yml.erb))
1. In the Kubernetes Cluster, we have installed the [External Secrets Operator (ESO)](https://external-secrets.io/) using helm+opentofu (see: [`eks-cluster/external-secrets-operator.tf`](../../tofu/codeai-k8s/eks-cluster/external-secrets-operator.tf))
1. In each Kubernetes namespace (staging/prod/levelbuilder/test/adhoc-*) we've provisioned by opentofu a namespace-scoped ESO `SecretStore` named `aws-secrets-manager-store` ([`eks-cluster-addons/external-secrets-operator-config.tf`](../../tofu/codeai-k8s/eks-cluster-addons/external-secrets-operator-config.tf))
1. That `SecretStore` uses a dedicated Kubernetes service account for staging, tied to AWS via IRSA. (see: [`eso-per-env/main.tf`](../../tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/main.tf))
1. The AWS IAM role for that service account is scoped to be able to access only AWS Secrets matching: ([`eso-per-env/iam.tf`](../../tofu/codeai-k8s/eks-cluster-addons/modules/eso-per-env/iam.tf))
   - `staging/cdo/*`
   - `CfnStack/staging/*`
1. Each dashboard helm deployment provisions an `ExternalSecret` which configures the External Secrets Operator to periodically sync AWS secrets matching `staging/cdo/*` into Kubernetes Secret `cdo-secrets` ([`k8s/helm/templates/aws-secrets-manager.yaml`](../templates/aws-secrets-manager.yaml))
   - While syncing it removes the `staging/cdo` prefix.
   - The sync refreshes every 5 minutes 
1. So now we have in our Kubernetes cluster in the `staging` namespace a Kubernetes Secret `cdo-secrets` with 50+ child keys, one of which is `db_writer`
1. When a dashboard pod launches, its manifest specifies that Kubernetes secret `cdo-secrets`'s sub-keys, including `db_writer`, will be mapped onto its environment variables, each with a `CDO_` prefix. ([`k8s/helm/templates/dashboard/_dashboard.yaml`](../templates/dashboard/_dashboard.yaml))
1. Therefore, when `db_writer` key from `cdo-secrets` will be available as the `CDO_db_writer` env var inside the pod.
1. `CDO.*` in ruby reads from `CDO_*` env variables. ([`lib/cdo.rb`](../../../lib/cdo.rb))
1. So in ruby running in the dashboard pod we now have `CDO.db_writer`.

## Local Secrets Can Override AWS Secrets Manager Secrets

This allows us to inject things like mysql and redis credentials for adhoc or equivalent deploys.

- `cdo-secrets-local` is a Kubernetes `Secret` object with many sub-secrets
- it is Helm-managed instead of AWS-backed
- the dashboard pod imports it with `envFrom`
- its keys become `CDO_*` environment variables in the pod
- Dashboard makes `CDO_*` env variable available as `CDO.*` ruby objects.

### A Note On Storage And Encryption

- the source secret in AWS Secrets Manager is encrypted at rest there
- after sync, the value is also stored in a Kubernetes `Secret` object, not just transiently in process memory
