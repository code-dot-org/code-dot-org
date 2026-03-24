variable "dex_google_client_id" {
  description = "Google OAuth client ID for Dex."
  type        = string
}

variable "dex_google_client_secret" {
  description = "Optional Google OAuth client secret for Dex. If set, we upload it to AWS Secrets Manager. If not set, we download it from AWS Secrets Manager."
  type        = string
  sensitive   = true
  default     = null
}

variable "kargo_k8s_gitops_repo_username" {
  description = "Optional Git username for Kargo pushes to k8s-gitops. Set it to upload; omit it to read from AWS Secrets Manager."
  type        = string
  sensitive   = true
  default     = null
}

variable "kargo_k8s_gitops_repo_password" {
  description = "Optional Git password or PAT for Kargo pushes to k8s-gitops. Set it to upload; omit it to read from AWS Secrets Manager."
  type        = string
  sensitive   = true
  default     = null
}

variable "kargo_github_org_webhook_secret" {
  description = "Optional shared secret for the code-dot-org GitHub organization webhook that feeds Kargo. Set it to upload; omit it to read from AWS Secrets Manager."
  type        = string
  sensitive   = true
  default     = null
}
