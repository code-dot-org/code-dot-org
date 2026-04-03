variable "cluster_name" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_version" {
  type = string
}

variable "cluster_subdomain" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "single_namespace_environment_types" {
  type = set(string)
}

variable "cluster_subdomain_zone_id" {
  type = string
}
