resource "kubernetes_namespace_v1" "dex" {
  metadata {
    name = local.dex_namespace_name
  }
}

resource "kubernetes_service_account_v1" "dex_external_secrets" {
  metadata {
    name      = local.dex_external_secrets_service_account_name
    namespace = kubernetes_namespace_v1.dex.metadata[0].name

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.dex_external_secrets.arn
    }
  }
}
