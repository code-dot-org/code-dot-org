moved {
  from = aws_secretsmanager_secret_version.this
  to   = aws_secretsmanager_secret_version.managed_aws_version
}
