variable "environment_type" {
  description = "Environment type (production, staging, test, levelbuilder). Also used as the k8s namespace name and the AWS secret path prefix."
  type        = string
}

variable "single_namespace_environment_type" {
  description = "Whether this environment type uses a single namespace-scoped SecretStore rather than a regex-restricted ClusterSecretStore."
  type        = bool
}

variable "multi_namespace_regexes" {
  description = "Optional namespace regex restrictions for a ClusterSecretStore. When set, the module creates a cluster-scoped store and skips namespace creation."
  type        = list(string)
  default     = null

  validation {
    condition     = var.multi_namespace_regexes == null || length(var.multi_namespace_regexes) > 0
    error_message = "multi_namespace_regexes must be null or a non-empty list."
  }

  validation {
    condition     = var.single_namespace_environment_type ? var.multi_namespace_regexes == null : var.multi_namespace_regexes != null
    error_message = "multi_namespace_regexes must be null when single_namespace_environment_type is true, and set when it is false."
  }
}

variable "iam_role_arn" {
  description = "ARN of the pre-created IRSA IAM role used by ESO from this service account."
  type        = string
}

variable "region" {
  description = "AWS region (e.g. us-east-1). Used to construct Secrets Manager ARNs."
  type        = string
}

variable "aws_secrets_manager_refresh_interval" {
  description = "How often ESO should refresh secrets from AWS Secrets Manager for this environment."
  type        = string
  default     = "5m"
}
