variable "dex_google_client_secret" {
  description = "Optional Google OAuth client secret for Dex. If set, we upload it to AWS Secrets Manager. If not set, we download it from AWS Secrets Manager."
  type        = string
  sensitive   = true
  default     = null
}

variable "dex_google_client_id" {
  description = "Google OAuth client ID for Dex. Published through codeai-cluster-config.values.yaml for chart wiring."
  type        = string
  default     = "254945981659-9p8ctpobals7gmah0ptlt70t29eflira.apps.googleusercontent.com"
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
