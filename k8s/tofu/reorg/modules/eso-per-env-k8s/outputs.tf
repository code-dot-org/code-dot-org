output "iam_role_arn" {
  description = "ARN of the IRSA IAM role used by this environment's ESO store."
  value       = var.iam_role_arn
}

output "secret_store_name" {
  description = "Name of the ESO store created by this module. Reference this in ExternalSecret resources."
  value       = var.single_namespace_environment_type ? "aws-secrets-manager-store" : "aws-secrets-manager-store-${var.environment_type}"
}
