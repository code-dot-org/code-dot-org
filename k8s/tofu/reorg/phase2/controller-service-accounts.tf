#============================================================
# Namespaces and service accounts consumed by static phase3 charts
#============================================================

resource "kubernetes_namespace_v1" "external_dns" {
  metadata {
    name = "external-dns"
  }
}

resource "kubernetes_service_account_v1" "external_dns" {
  metadata {
    name      = "external-dns-sa"
    namespace = kubernetes_namespace_v1.external_dns.metadata[0].name

    annotations = {
      "eks.amazonaws.com/role-arn" = module.external_dns_addon.gitops_metadata.external_dns_iam_role_arn
    }
  }
}

resource "kubernetes_service_account_v1" "aws_load_balancer_controller" {
  metadata {
    name      = "aws-load-balancer-controller-sa"
    namespace = "kube-system"

    annotations = {
      "eks.amazonaws.com/role-arn" = module.aws_load_balancer_controller_addon.gitops_metadata.aws_load_balancer_controller_iam_role_arn
    }
  }
}

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
