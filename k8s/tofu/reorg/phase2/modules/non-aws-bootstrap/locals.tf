# Only locals used in multiple .tf files should live here.
locals {
  cluster_name      = var.cluster_name
  cluster_region    = var.cluster_region
  cluster_subdomain = var.cluster_subdomain

  kargo_shared_resources_namespace_name       = "kargo-shared-resources"
  kargo_shared_resources_service_account_name = "external-secrets-sa-kargo-shared-resources"
  kargo_shared_resources_secret_store_name    = "aws-secrets-manager-store-kargo-shared-resources"

  kargo_hostname = "kargo.${local.cluster_subdomain}"

  kargo_secret_prefix = "k8s/tofu/${local.cluster_name}/kargo"
}
