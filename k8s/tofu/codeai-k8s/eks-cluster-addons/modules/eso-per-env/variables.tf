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

variable "cluster_oidc_issuer_url" {
  description = "EKS OIDC issuer URL (e.g. https://oidc.eks.us-east-1.amazonaws.com/id/XXX). Used to build the IRSA trust policy."
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider. Used as the Federated principal in the IRSA trust policy."
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID. Used to construct Secrets Manager ARNs in the IAM policy."
  type        = string
}

variable "region" {
  description = "AWS region (e.g. us-east-1). Used to construct Secrets Manager ARNs."
  type        = string
}
