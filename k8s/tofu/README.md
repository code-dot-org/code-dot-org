# OpenTofu norms for our repo

## Non-secrets: commit to terraform.tfvars

- Commit non-secrets into the repo as terraform.tfvars, or, if we need env specific naming for something $env.tfvars e.g. staging.tfvars

## Secrets: use module/bootstrapped-aws-secret

- To make secret upload/download to AWS Secrets Manager easy+consistent **use module/bootstrapped-aws-secret**
  - See: `k8s/tofu/modules/bootstrapped-aws-secret/README.md`**
  - For an example using the module, see: `k8s/tofu/codeai-k8s/eks-cluster-addons/dex-google-client-secret.tf`
- Prefix secrets in AWS Secrets Manager with `k8s/tofu/${clustername}/` for per-cluster secrets, or `k8s/tofu/` for all-cluster secrets.
