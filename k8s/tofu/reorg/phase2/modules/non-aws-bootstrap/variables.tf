variable "cluster_name" {
  description = "Cluster name."
  type        = string
}

variable "cluster_region" {
  description = "AWS region of the cluster."
  type        = string
}

variable "cluster_subdomain" {
  description = "Cluster subdomain FQDN, for example k8s.code.org."
  type        = string
}

variable "kargo_external_secret_stores_iam_role_arn" {
  description = "IAM role ARN used by the Kargo shared-resources SecretStore."
  type        = string
}

variable "kargo_github_org_webhook_secret_aws_name" {
  description = "AWS Secrets Manager name holding the Kargo GitHub org webhook secret."
  type        = string
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
