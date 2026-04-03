#============================================================
# Publish cluster facts for later Helm / GitOps consumers.
#============================================================
#
# These values originate in cluster, but cluster-infra owns the consumer-facing
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
    cluster_subdomain_wildcard_certificate_arn = module.networking.cluster_subdomain_wildcard_certificate_arn
    dex_google_client_id                       = var.dex_google_client_id
    single_namespace_environment_types         = jsonencode(sort(tolist(local.single_namespace_environment_types)))
    frontend_security_group_namespaces         = jsonencode(sort(tolist(toset(local.cluster_outs.frontend_security_group_namespaces))))
    cluster_primary_security_group_id          = local.cluster_outs.cluster_primary_security_group_id
    frontend_security_group_id                 = local.cluster_outs.frontend_security_group_id
    eso_iam_role_arns                          = jsonencode(module.standard_envtypes.eso_iam_role_arns)
    kargo_external_secret_stores_iam_role_arn  = module.kargo_secrets.kargo_external_secret_stores_iam_role_arn
  }
}
