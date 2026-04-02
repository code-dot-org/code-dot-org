module "non_aws_bootstrap" {
  source = "./modules/non-aws-bootstrap"

  providers = {
    aws        = aws
    kubernetes = kubernetes
    helm       = helm
    github     = github
  }

  cluster_name                              = local.cluster_name
  cluster_region                            = local.cluster_region
  cluster_subdomain                         = local.cluster_subdomain
  kargo_external_secret_stores_iam_role_arn = aws_iam_role.kargo_external_secret_stores.arn
  kargo_github_org_webhook_secret_aws_name  = module.kargo_github_org_webhook_secret.aws_secret_name
  kargo_k8s_gitops_repo_username            = var.kargo_k8s_gitops_repo_username
  kargo_k8s_gitops_repo_password            = var.kargo_k8s_gitops_repo_password
}
