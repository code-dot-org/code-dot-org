module "dex" {
  source = "./infra/dex"

  cluster_name                    = local.cluster_name
  dex_google_client_secret        = var.dex_google_client_secret
  google_service_account_key_json = data.terraform_remote_state.codeai_k8s_dex.outputs.google_service_account_key_json
}

module "crossplane" {
  source = "./infra/crossplane"

  cluster_name                       = local.cluster_name
  cluster_subdomain                  = local.cluster_subdomain
  oidc_provider_arn                  = local.oidc_provider_arn
  parent_domain                      = local.cluster_outs.parent_domain
  single_namespace_environment_types = local.single_namespace_environment_types
}

module "kargo_secrets" {
  source = "./infra/kargo-secrets"

  providers = {
    github = github.admin
  }

  cluster_name                   = local.cluster_name
  cluster_subdomain              = local.cluster_subdomain
  kargo_k8s_gitops_repo_username = var.kargo_k8s_gitops_repo_username
  kargo_k8s_gitops_repo_password = var.kargo_k8s_gitops_repo_password
}
