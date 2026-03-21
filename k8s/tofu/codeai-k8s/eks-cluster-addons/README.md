# eks-cluster-addons

Installs core infra k8s resources into the cluster created by `eks-cluster/`.

Includes:
- AWS Load Balancer Controller
- External Secrets Operator per-environment SecretStores (staging, levelbuilder, etc) + ClusterSecretStore for adhocs
- Dex (SSO for K8s)
- ArgoCD
- Kargo writeback git credentials

## Usage

If this is the **first time you've setup this cluster**, follow [first time cluster setup](#first-time-cluster-setup)

```bash
tofu init

# admin role required because it creates IAM
AWS_PROFILE=codeorg-admin tofu apply
```

## First time cluster setup

1. Tofu module `../../codeai-k8s-dex` needs to have been applied at least once (its shared by all clusters)
1. Apply tofu module `../eks-cluster/` before this one
1. Review and edit `terraform.tfvars`:
   1. Follow [Bootstrapping Google OAuth Client for SSO](#bootstrapping-google-oauth-client-for-sso) to set `dex_*` variables.
   1. Follow [Bootstrapping Kargo git credentials](#bootstrapping-kargo-git-credentials) to set `kargo_*` variables.

1. Run: `AWS_PROFILE=codeorg-admin tofu apply`
1. **Remove `dex_google_client_secret` and `kargo_k8s_gitops_repo_password` from `terraform.tfvars`** before you forget and commit them.

### Bootstrapping Google OAuth Client for SSO

If this is a new cluster, you've got to manually setup a Google OAuth 2.0 Client, or you
won't be able to login to stuff (e.g. ArgoCD). Unfortunately, Google has not provided
APIs for this, so it can't be automatically done by IaC.

This has to be setup per-cluster because the redirect url to Dex will need to be specific
to this cluster and Google doesn't allow wildcards in redirect urls.

1. Run `tofu init`
1. To get the redirect url, run: `tofu console <<< 'local.dex_google_redirect_url'`, it should look kinda like https://dex.$subdomain.code.org/callback
1. Create a new Google OAuth 2.0 Client:
   1. Open `https://console.cloud.google.com/auth/clients`
   1. Click `Create client`
   1. Choose `Web application`
   1. Name it something like `$clustername-codeai-k8s-dex`
   1. Add the redirect url from step 2 as an `Authorized redirect URI`
   1. Create the client
   1. Note the client secret and client id to use in the next step
1. Edit `terraform.tfvars`:
   1. set `dex_google_client_id`
   1. set `dex_google_client_secret` to bootstrap the secret into AWS Secrets Manager
      as `k8s/tofu/${cluster_name}/dex_google_client_secret` but DO NOT COMMIT this line.
1. Continue [First time cluster setup](#first-time-cluster-setup)
After bootstrap, this module reads the credentials from AWS Secrets Manager.

### Bootstrapping Kargo git credentials

Kargo needs Git credentials so it can push deployment updates to `code-dot-org/k8s-gitops`.

1. Select a GitHub username (deploy-code-org) + create a GitHub personal access token (PAT)
   with write access to `code-dot-org/k8s-gitops`
1. Edit `terraform.tfvars`:
   1. set `kargo_k8s_gitops_repo_username`: github username
   1. set `kargo_k8s_gitops_repo_password`: PAT to bootstrap the secret into AWS Secrets Manager
      as `k8s/tofu/${cluster_name}/kargo/gitops_repo_password` but DO NOT COMMIT this line.
1. Run `AWS_PROFILE=codeorg-admin tofu apply`
1. Remove both values from `terraform.tfvars`

After bootstrap, this module reads the credentials from AWS Secrets Manager and the
External Secrets Operator (ESO) syncs them into Kubernetes secret `kargo-k8s-gitops`
in namespace `kargo-shared-resources`.

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

### Gateway API + ExternalDNS (public HTTP by ALB address, then DNS)
```bash
./test/test-gateway-http.sh
```
