module "dex" {
  source = "./infra/dex"

  cluster_name                    = local.cluster_name
  cluster_region                  = local.cluster_region
  cluster_oidc_issuer_url         = local.cluster_oidc_issuer_url
  oidc_provider_arn               = local.oidc_provider_arn
  dex_google_client_secret        = var.dex_google_client_secret
  google_service_account_key_json = data.terraform_remote_state.codeai_k8s_dex.outputs.google_service_account_key_json
}

module "external_dns" {
  source = "./infra/external-dns"

  cluster_name      = local.cluster_name
  cluster_endpoint  = local.cluster_endpoint
  cluster_version   = local.cluster_version
  oidc_provider_arn = local.oidc_provider_arn
  parent_domain     = local.cluster_outs.parent_domain
  cluster_subdomain = local.cluster_subdomain
}

module "networking" {
  source = "./infra/networking"

  cluster_name                       = local.cluster_name
  cluster_endpoint                   = local.cluster_endpoint
  cluster_version                    = local.cluster_version
  cluster_subdomain                  = local.cluster_subdomain
  oidc_provider_arn                  = local.oidc_provider_arn
  single_namespace_environment_types = local.single_namespace_environment_types
  cluster_subdomain_zone_id          = module.external_dns.cluster_subdomain_zone_id
}

module "kargo_secrets" {
  source = "./infra/kargo-secrets"

  cluster_name                    = local.cluster_name
  cluster_region                  = local.cluster_region
  cluster_subdomain               = local.cluster_subdomain
  cluster_oidc_issuer_url         = local.cluster_oidc_issuer_url
  oidc_provider_arn               = local.oidc_provider_arn
  kargo_k8s_gitops_repo_username  = var.kargo_k8s_gitops_repo_username
  kargo_k8s_gitops_repo_password  = var.kargo_k8s_gitops_repo_password
}

module "standard_envtypes" {
  source = "./infra/standard-envtypes"

  cluster_oidc_issuer_url            = local.cluster_oidc_issuer_url
  oidc_provider_arn                  = local.oidc_provider_arn
  cluster_region                     = local.cluster_region
  single_namespace_environment_types = local.single_namespace_environment_types
}
