# Only locals used in multiple .tf files should live here.
locals {
  cluster_outs = data.terraform_remote_state.phase1.outputs

  cluster_name            = local.cluster_outs.cluster_name
  cluster_endpoint        = local.cluster_outs.cluster_endpoint
  cluster_region          = local.cluster_outs.cluster_region
  cluster_version         = local.cluster_outs.cluster_version
  cluster_subdomain       = local.cluster_outs.cluster_subdomain
  cluster_subdomain_label = local.cluster_outs.cluster_subdomain_label
  parent_domain           = local.cluster_outs.parent_domain
  vpc_id                  = local.cluster_outs.vpc_id

  cluster_primary_security_group_id  = local.cluster_outs.cluster_primary_security_group_id
  frontend_security_group_id         = local.cluster_outs.frontend_security_group_id
  frontend_security_group_namespaces = toset(local.cluster_outs.frontend_security_group_namespaces)

  oidc_provider_arn       = local.cluster_outs.oidc_provider_arn
  cluster_oidc_issuer_url = local.cluster_outs.cluster_oidc_issuer_url

  single_namespace_environment_types = toset(local.cluster_outs.single_namespace_environment_types)
}
