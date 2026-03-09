output "iam_role_arn" {
  description = "ARN of the IRSA IAM role created for this environment's ESO SecretStore."
  value       = aws_iam_role.eso.arn
}

output "secret_store_name" {
  description = "Name of the ESO SecretStore created in this namespace. Reference this in ExternalSecret resources."
  value       = "aws-secrets-manager"
}

output "namespace" {
  description = "Kubernetes namespace created for this environment."
  value       = kubernetes_namespace_v1.this.metadata[0].name
}
