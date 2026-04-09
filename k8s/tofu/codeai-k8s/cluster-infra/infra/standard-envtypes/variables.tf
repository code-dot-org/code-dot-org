variable "cluster_oidc_issuer_url" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "cluster_region" {
  type = string
}

variable "single_namespace_environment_types" {
  type = set(string)
}
