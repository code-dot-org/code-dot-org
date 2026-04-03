resource "random_password" "this" {
  count = var.bootstrap_with_random_value ? 1 : 0

  length  = 24
  special = false
}

locals {
  secret_value_to_write = coalesce(var.secret_value_to_bootstrap, try(random_password.this[0].result, null))
}

resource "aws_secretsmanager_secret" "this" {
  name = var.aws_secret_name
}

resource "aws_secretsmanager_secret_version" "this" {
  count = local.secret_value_to_write != null ? 1 : 0

  secret_id                = aws_secretsmanager_secret.this.id
  secret_string_wo         = local.secret_value_to_write
  secret_string_wo_version = parseint(substr(md5(nonsensitive(local.secret_value_to_write)), 0, 8), 16)

  depends_on = [
    aws_secretsmanager_secret.this,
  ]
}

data "aws_secretsmanager_secret_version" "this" {
  secret_id = aws_secretsmanager_secret.this.id

  depends_on = [
    aws_secretsmanager_secret_version.this,
  ]
}
