variable "environment" {
  description = "Environment name (production, staging, test, levelbuilder). Also used as the k8s namespace name and the AWS secret path prefix."
  type        = string
}

variable "cfn_stack_name" {
  description = "CloudFormation stack name for CfnStack/* secret access. Defaults to var.environment if not set."
  type        = string
  default     = null
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
