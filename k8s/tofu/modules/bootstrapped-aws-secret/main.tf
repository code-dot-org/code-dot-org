resource "aws_secretsmanager_secret" "this" {
  name = var.aws_secret_name
}

locals {
  # Prefer an explicitly passed `secret_value_to_bootstrap`, then generate a random password
  # if `bootstrap_with_random_value`, then fallback to the current AWS value.
  secret_value = coalesce(
    var.secret_value_to_bootstrap,
    try(random_password.this[0].result, null),
    try(data.aws_secretsmanager_secret_version.current_aws_version[0].secret_string, null),
  )
}

# Generate a value only when the caller explicitly specifies `bootstrap_with_random_value`
resource "random_password" "this" {
  count = var.bootstrap_with_random_value ? 1 : 0

  length  = 24
  special = false
}

# We fetch the current AWS version in case no values are passed, and use that to keep the
# managed_aws_version stable, so it doesn't get deleted when we aren't bootstrapping.
data "aws_secretsmanager_secret_version" "current_aws_version" {
  count = var.secret_value_to_bootstrap == null && !var.bootstrap_with_random_value ? 1 : 0

  secret_id = aws_secretsmanager_secret.this.id

  depends_on = [
    aws_secretsmanager_secret.this,
  ]
}


resource "aws_secretsmanager_secret_version" "managed_aws_version" {
  secret_id                = aws_secretsmanager_secret.this.id
  secret_string_wo         = local.secret_value
  secret_string_wo_version = parseint(substr(md5(nonsensitive(local.secret_value)), 0, 8), 16)

  depends_on = [
    aws_secretsmanager_secret.this,
  ]
}
