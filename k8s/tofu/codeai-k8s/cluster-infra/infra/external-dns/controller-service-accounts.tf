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
