variable "cluster_name" {
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
