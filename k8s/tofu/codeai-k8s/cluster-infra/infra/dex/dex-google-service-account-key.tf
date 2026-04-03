module "dex_google_service_account_key" {
  source = "../../../../modules/bootstrapped-aws-secret"

  aws_secret_name           = local.dex_google_service_account_key_aws_name
  secret_value_to_bootstrap = var.google_service_account_key_json
}
