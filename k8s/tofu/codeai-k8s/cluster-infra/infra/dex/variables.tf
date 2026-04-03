variable "cluster_name" {
  type = string
}

variable "cluster_region" {
  type = string
}

variable "cluster_oidc_issuer_url" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "dex_google_client_secret" {
  type      = string
  sensitive = true
}

variable "google_service_account_key_json" {
  type      = string
  sensitive = true
}
