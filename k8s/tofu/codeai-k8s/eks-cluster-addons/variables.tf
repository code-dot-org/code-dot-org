variable "dex_google_client_id" {
  description = "Google OAuth client ID for Dex."
  type        = string
}

variable "dex_google_client_secret" {
  description = "Google OAuth client secret for Dex."
  type        = string
  sensitive   = true
}
