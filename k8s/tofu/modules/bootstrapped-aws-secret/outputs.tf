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
  value       = data.aws_secretsmanager_secret_version.this.secret_string
  sensitive   = true
}
