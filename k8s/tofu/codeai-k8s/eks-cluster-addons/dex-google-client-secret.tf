locals {
  dex_google_client_secret_secret_name = "k8s/tofu/${local.cluster_name}/dex_google_client_secret"
  dex_google_client_secret             = data.aws_secretsmanager_secret_version.dex_google_client_secret.secret_string
  dex_google_client_secret_wo_version = (
    var.dex_google_client_secret == null
    ? null
    : parseint(substr(md5(nonsensitive(var.dex_google_client_secret)), 0, 8), 16)
  )
}

resource "aws_secretsmanager_secret" "dex_google_client_secret" {
  name = local.dex_google_client_secret_secret_name
}

resource "aws_secretsmanager_secret_version" "dex_google_client_secret" {
  count = var.dex_google_client_secret == null ? 0 : 1

  secret_id                = local.dex_google_client_secret_secret_name
  secret_string_wo         = var.dex_google_client_secret
  secret_string_wo_version = local.dex_google_client_secret_wo_version

  depends_on = [
    aws_secretsmanager_secret.dex_google_client_secret,
  ]
}

data "aws_secretsmanager_secret_version" "dex_google_client_secret" {
  secret_id = local.dex_google_client_secret_secret_name

  depends_on = [
    aws_secretsmanager_secret_version.dex_google_client_secret,
  ]
}
