# eks-cluster-addons

Installs Helm addons and Kubernetes resources into the cluster created by `eks-cluster/`.
Reads cluster outputs automatically from the eks-cluster remote state — no variables to pass.

Includes:
- AWS Load Balancer Controller
- External Secrets per-environment SecretStores + ClusterSecretStore for adhocs

## Usage

Apply `../eks-cluster/` first, then:

```bash
tofu init

# admin role required because it creates IAM
AWS_PROFILE=codeorg-admin tofu apply
```

## Smoke Tests

Each test takes about 5 minutes.

### External Secrets
```bash
./test/test-external-secrets.sh
```

### AWS Load Balancer Controller ingresses (public HTTP)
```bash
./test/test-ingress.sh
```

### AWS NLB (public IP services)
```bash
./test/test-nlb.sh
```
