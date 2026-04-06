# cluster-infra

Creates the AWS-side resources needed by cluster-infra-argocd and publishes config
values (mostly ARNs) for later gitops consumers as  `ConfigMap/codeai-cluster-config` and 
[codeai-cluster-config.values.yaml](https://github.com/code-dot-org/k8s-gitops/blob/main/apps/infra/codeai-cluster-config.values.yaml).

Apply `../cluster/` first.

## Usage

```bash
tofu init
AWS_PROFILE=codeorg-admin tofu apply
```

## Bootstrap inputs

`terraform.tfvars` carries bootstrap values for secrets that must first land in
AWS Secrets Manager:

- `dex_google_client_secret`
- `kargo_k8s_gitops_repo_username`
- `kargo_k8s_gitops_repo_password`

Remove those values after the first successful apply. This phase also creates
the GitHub organization webhook for Kargo and generates its shared secret.

## First-time bootstrap

1. Apply `../../codeai-k8s-dex/` at least once.
1. Apply `../cluster/` first.
1. Review and edit `terraform.tfvars`:
   1. Follow [Bootstrapping Google OAuth Client for SSO](#bootstrapping-google-oauth-client-for-sso)
      to set `dex_google_client_secret`.
   1. Follow [Bootstrapping Kargo secrets](#bootstrapping-kargo-secrets) to set `kargo_*` variables.
1. Run `AWS_PROFILE=codeorg-admin tofu apply`.
1. Remove `dex_google_client_secret` and `kargo_k8s_gitops_repo_password`
   from `terraform.tfvars` before you forget.

### Bootstrapping Google OAuth Client for SSO

If this is a new cluster, you must manually create a Google OAuth 2.0 client.
Google still does not expose an API for this.

This is per-cluster because the Dex redirect URI is cluster-specific and Google
does not allow wildcard redirect URIs.

1. The redirect URI for the current cluster is `https://dex.k8s.code.org/callback`.
1. Create a new Google OAuth 2.0 client:
   1. Open `https://console.cloud.google.com/auth/clients`
   1. Click `Create client`
   1. Choose `Web application`
   1. Name it something like `codeai-k8s-dex`
   1. Add the redirect URI above as an `Authorized redirect URI`
   1. Create the client
   1. Note the client secret
1. Edit `terraform.tfvars`:
   1. set `dex_google_client_secret` to bootstrap the secret into AWS Secrets
      Manager as `k8s/tofu/${cluster_name}/dex_google_client_secret`, but do
      not commit this line

### Bootstrapping Kargo secrets

Kargo needs two GitHub-related secrets:

1. Git credentials so it can push deployment updates to `code-dot-org/k8s-gitops`
1. A webhook secret so GitHub can send org webhooks to Kargo

#### Git credentials

1. Pick a GitHub username and create a PAT with write access to
   `code-dot-org/k8s-gitops`
1. Edit `terraform.tfvars`:
   1. set `kargo_k8s_gitops_repo_username`
   1. set `kargo_k8s_gitops_repo_password` to bootstrap the secret into AWS
      Secrets Manager as `k8s/tofu/${cluster_name}/kargo/gitops_repo_password`,
      but do not commit this line

#### GitHub webhook secret

This phase generates the GitHub webhook secret automatically and writes it to
`k8s/tofu/${cluster_name}/kargo/github_org_webhook_secret` in AWS Secrets
Manager.

After bootstrap, `cluster-infra-argocd` syncs these into Kubernetes as:

1. `kargo-k8s-gitops` in namespace `kargo-shared-resources`
1. `github-org-webhook-secret` in namespace `kargo-system-resources`
