# Only locals used in multiple .tf files should live here.
locals {
  cluster_outs = data.terraform_remote_state.eks_cluster.outputs

  cluster_name                       = local.cluster_outs.cluster_name
  cluster_endpoint                   = local.cluster_outs.cluster_endpoint
  cluster_region                     = local.cluster_outs.cluster_region
  cluster_subdomain                  = local.cluster_outs.cluster_subdomain

  cluster_primary_security_group_id  = local.cluster_outs.cluster_primary_security_group_id
  frontend_security_group_id         = local.cluster_outs.frontend_security_group_id
  frontend_security_group_namespaces = toset(local.cluster_outs.frontend_security_group_namespaces)

  oidc_provider_arn                  = local.cluster_outs.oidc_provider_arn
  
  ingress_certificate_arn            = local.cluster_outs.cluster_subdomain_wildcard_certificate_arn
  
  single_namespace_environment_types = toset(local.cluster_outs.single_namespace_environment_types)

  argocd_hostname = "argocd.${local.cluster_subdomain}"
  kargo_hostname  = "kargo.${local.cluster_subdomain}"
  dex_hostname    = "dex.${local.cluster_subdomain}"
}
