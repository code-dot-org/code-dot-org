# Only locals used in multiple .tf files should live here.
locals {
  cluster_name            = data.terraform_remote_state.eks_cluster.outputs.cluster_name
  cluster_endpoint        = data.terraform_remote_state.eks_cluster.outputs.cluster_endpoint
  cluster_region          = data.terraform_remote_state.eks_cluster.outputs.cluster_region
  cluster_subdomain       = data.terraform_remote_state.eks_cluster.outputs.cluster_subdomain
  oidc_provider_arn       = data.terraform_remote_state.eks_cluster.outputs.oidc_provider_arn
  ingress_certificate_arn = data.terraform_remote_state.eks_cluster.outputs.cluster_subdomain_wildcard_certificate_arn

  argocd_hostname = "argocd.${local.cluster_subdomain}"
  dex_hostname    = "dex.${local.cluster_subdomain}"
}
