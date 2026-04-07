variable "cluster_name" {
  type = string
}

variable "cluster_subdomain" {
  type = string
}

variable "kargo_k8s_gitops_repo_username" {
  type      = string
  sensitive = true
}

variable "kargo_k8s_gitops_repo_password" {
  type      = string
  sensitive = true
}
