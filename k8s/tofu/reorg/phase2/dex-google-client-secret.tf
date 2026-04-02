module "dex_google_client_secret" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = local.dex_google_client_secret_aws_secret_name
  secret_value_to_bootstrap = var.dex_google_client_secret
}
