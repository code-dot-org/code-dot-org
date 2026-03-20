# OpenTofu

Top-level notes for the OpenTofu roots under `k8s/tofu/`.

## OpenTofu norms

- Store secrets in AWS Secrets Manager with the prefix `k8s/tofu/${clustername}/` for per-cluster secrets, or `k8s/tofu/` for all-cluster secrets.
- Commit non-secrets into the repo as terraform.tfvars, or, if we need env specific naming for something $env.tfvars.
