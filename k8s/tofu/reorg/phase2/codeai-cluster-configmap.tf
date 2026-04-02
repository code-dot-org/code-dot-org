#============================================================
# Publish cluster facts for later Helm / GitOps consumers.
#============================================================
#
# These values originate in phase1, but phase2 owns the consumer-facing
# Kubernetes handoff object so later phases do not need raw remote-state outputs
# for this cluster-shape metadata.

resource "kubernetes_config_map_v1" "codeai_cluster_configmap" {
  metadata {
    name      = "codeai-cluster-config"
    namespace = "kube-system"
  }

  data = {
    cluster_name                               = local.cluster_name
    cluster_region                             = local.cluster_region
    cluster_subdomain                          = local.cluster_subdomain
    cluster_subdomain_wildcard_certificate_arn = aws_acm_certificate_validation.cluster_subdomain_wildcard.certificate_arn
    single_namespace_environment_types         = jsonencode(sort(tolist(local.single_namespace_environment_types)))
    frontend_security_group_namespaces         = jsonencode(sort(tolist(local.frontend_security_group_namespaces)))
    cluster_primary_security_group_id          = local.cluster_primary_security_group_id
    frontend_security_group_id                 = local.frontend_security_group_id
    eso_iam_role_arns                          = jsonencode(local.eso_iam_role_arns)
    kargo_external_secret_stores_iam_role_arn  = aws_iam_role.kargo_external_secret_stores.arn
  }
}
