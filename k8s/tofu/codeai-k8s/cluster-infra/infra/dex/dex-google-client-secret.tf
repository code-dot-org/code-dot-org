locals {
  dex_secret_prefix                        = "k8s/tofu/${var.cluster_name}"
  dex_google_client_secret_aws_secret_name = "${local.dex_secret_prefix}/dex_google_client_secret"
  dex_google_service_account_key_aws_name  = "${local.dex_secret_prefix}/dex_google_service_account_key"
}

module "dex_google_client_secret" {
  source = "../../../../modules/bootstrapped-aws-secret"

  aws_secret_name           = local.dex_google_client_secret_aws_secret_name
  secret_value_to_bootstrap = var.dex_google_client_secret
}
