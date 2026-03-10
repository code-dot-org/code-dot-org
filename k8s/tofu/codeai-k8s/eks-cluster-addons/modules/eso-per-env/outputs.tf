output "iam_role_arn" {
  description = "ARN of the IRSA IAM role created for this environment's ESO store."
  value       = aws_iam_role.eso.arn
}

output "secret_store_name" {
  description = "Name of the ESO store created by this module. Reference this in ExternalSecret resources."
  value       = var.single_namespace_environment_type ? "aws-secrets-manager-store" : "aws-secrets-manager-store-${var.environment_type}"
}
