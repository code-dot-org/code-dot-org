locals {
  dex_google_client_secret = module.dex_google_client_secret.secret_value
}

module "dex_google_client_secret" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "k8s/tofu/${local.cluster_name}/dex_google_client_secret"
  secret_value_to_bootstrap = var.dex_google_client_secret
}
