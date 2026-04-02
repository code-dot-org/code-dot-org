#==============================================================
# Bootstrap Secrets to AWS Secrets Manager (if variables set)
#==============================================================

module "kargo_k8s_gitops_repo_username" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_username"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_username
}

module "kargo_k8s_gitops_repo_password" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_password"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_password
}
