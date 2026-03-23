resource "aws_secretsmanager_secret" "this" {
  name = var.aws_secret_name
}

resource "aws_secretsmanager_secret_version" "this" {
  count = var.secret_value_to_bootstrap == null ? 0 : 1

  secret_id                = aws_secretsmanager_secret.this.id
  secret_string_wo         = var.secret_value_to_bootstrap
  secret_string_wo_version = parseint(substr(md5(nonsensitive(var.secret_value_to_bootstrap != null ? var.secret_value_to_bootstrap : "")), 0, 8), 16)

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
