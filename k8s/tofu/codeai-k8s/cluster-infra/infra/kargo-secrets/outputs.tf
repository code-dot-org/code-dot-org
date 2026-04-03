output "kargo_external_secret_stores_iam_role_arn" {
  value = aws_iam_role.kargo_external_secret_stores.arn
}

output "kargo_k8s_gitops_repo_username" {
  value = module.kargo_k8s_gitops_repo_username.secret_value
}

output "kargo_k8s_gitops_repo_password" {
  value     = module.kargo_k8s_gitops_repo_password.secret_value
  sensitive = true
}
