variable "region" {
  description = "AWS region for the cluster and supporting resources."
  type        = string
  default     = "us-east-1"
}

variable "dex_google_client_id" {
  description = "Google OAuth client ID for Dex."
  type        = string
}

variable "dex_google_client_secret" {
  description = "Google OAuth client secret for Dex."
  type        = string
  sensitive   = true
}

variable "dex_google_workspace_domain" {
  description = "Google Workspace domain allowed to sign in via Dex."
  type        = string
  default     = "code.org"
}
