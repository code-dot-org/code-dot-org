variable "cluster_name" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "parent_domain" {
  type = string
}

variable "cluster_subdomain" {
  type = string
}

variable "single_namespace_environment_types" {
  type = set(string)
}
