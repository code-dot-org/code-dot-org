# phase2

Creates the AWS-side resources needed by the split cluster add-ons, plus the
remaining bootstrap writes that still belong before phase3.
It also publishes a small `codeai-cluster-config` `ConfigMap` in `kube-system`
for later Helm / GitOps consumers.

The root is thin. The bucketed resource ownership lives under `./infra/`,
aligned with `../phase3/infra/`:

- `infra-modules.tf`

`codeai-cluster-configmap.tf` remains the only root-owned resource file.

This phase consumes remote state from `../phase1/`. Apply
`../../codeai-k8s-dex/` first if this is a new setup.

## Usage

```bash
tofu init
AWS_PROFILE=codeorg-admin tofu apply
```

## Bootstrap inputs

`terraform.tfvars` carries bootstrap values for secrets that must first land in
AWS Secrets Manager:

- `dex_google_client_secret`
- `kargo_github_org_webhook_secret`
- `kargo_k8s_gitops_repo_username`
- `kargo_k8s_gitops_repo_password`

Remove those values after the first successful apply. This phase also creates
the GitHub organization webhook for Kargo.
