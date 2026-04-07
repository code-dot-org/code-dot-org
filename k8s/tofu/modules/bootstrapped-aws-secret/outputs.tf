output "secret_id" {
  description = "AWS Secrets Manager secret id."
  value       = aws_secretsmanager_secret.this.id
}

output "aws_secret_name" {
  description = "AWS Secrets Manager secret name."
  value       = aws_secretsmanager_secret.this.name
}

output "secret_value" {
  description = "Current AWS Secrets Manager secret value."
  value       = local.secret_value
  sensitive   = true

  depends_on = [
    aws_secretsmanager_secret_version.managed_aws_version,
  ]
}
