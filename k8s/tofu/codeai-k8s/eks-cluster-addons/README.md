# eks-cluster-addons

Installs Helm addons and Kubernetes resources into the cluster created by `eks-cluster/`.
Reads cluster outputs automatically from the eks-cluster remote state — no variables to pass.

Includes:
- AWS Load Balancer Controller
- External Secrets Operator + per-environment SecretStores + ClusterSecretStore for adhocs

## Usage

Apply `../eks-cluster/` first, then:

```bash
tofu init

# 1) when bootstrapping, you'll need to apply this first (it defines CRDs that step #2 needs):
tofu apply -target=helm_release.external_secrets

# 2) now apply everything else, admin role required because it creates IAM
AWS_PROFILE=codeorg-admin tofu apply
```

NOTE! If you get errors like `│ Error: API did not recognize GroupVersionKind from manifest (CRD may not be installed)`
you probably skipped step (1) where we do a `tofu apply -target=helm_release.external_secrets` before the main apply.

## Smoke Tests

Each test takes about 5 minutes.

### Pod DNS reachability
```bash
./test/test-dns.sh
```

### AWS Load Balancer Controller ingresses (public HTTP)
```bash
./test/test-ingress.sh
```

### AWS NLB (public IP services)
```bash
./test/test-nlb.sh
```
