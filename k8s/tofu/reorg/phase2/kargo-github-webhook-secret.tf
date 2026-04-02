#==============================================================
# Bootstrap Secret to AWS Secrets Manager (if variable set)
#==============================================================

locals {
  kargo_github_webhook_secret_aws_name = "${local.kargo_secret_prefix}/github_org_webhook_secret"
}

module "kargo_github_org_webhook_secret" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = local.kargo_github_webhook_secret_aws_name
  secret_value_to_bootstrap = var.kargo_github_org_webhook_secret
}
