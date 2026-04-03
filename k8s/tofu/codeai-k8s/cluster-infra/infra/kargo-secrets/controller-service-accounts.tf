resource "kubernetes_namespace_v1" "kargo_system_resources" {
  metadata {
    name = local.kargo_system_resources_namespace_name
  }
}

resource "kubernetes_service_account_v1" "kargo_system_resources_eso" {
  metadata {
    name      = local.kargo_system_resources_service_account_name
    namespace = kubernetes_namespace_v1.kargo_system_resources.metadata[0].name

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.kargo_external_secret_stores.arn
    }
  }
}
