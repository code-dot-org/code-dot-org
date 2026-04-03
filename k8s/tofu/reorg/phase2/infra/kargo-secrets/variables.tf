variable "cluster_name" {
  type = string
}

variable "cluster_region" {
  type = string
}

variable "cluster_subdomain" {
  type = string
}

variable "cluster_oidc_issuer_url" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "kargo_github_org_webhook_secret" {
  type      = string
  sensitive = true
}

variable "kargo_k8s_gitops_repo_username" {
  type      = string
  sensitive = true
}

variable "kargo_k8s_gitops_repo_password" {
  type      = string
  sensitive = true
}
