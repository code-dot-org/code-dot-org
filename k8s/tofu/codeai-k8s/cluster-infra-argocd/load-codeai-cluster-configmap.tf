locals {
  cluster_config_raw = data.kubernetes_config_map_v1.codeai_cluster_config.data

  cluster_config = {
    cluster_name                               = local.cluster_config_raw.cluster_name
    cluster_region                             = local.cluster_config_raw.cluster_region
    cluster_subdomain                          = local.cluster_config_raw.cluster_subdomain
    cluster_subdomain_wildcard_certificate_arn = local.cluster_config_raw.cluster_subdomain_wildcard_certificate_arn

    dex_google_client_id                       = local.cluster_config_raw.dex_google_client_id

    single_namespace_environment_types         = toset(jsondecode(local.cluster_config_raw.single_namespace_environment_types))
    frontend_security_group_namespaces         = toset(jsondecode(local.cluster_config_raw.frontend_security_group_namespaces))

    cluster_primary_security_group_id          = local.cluster_config_raw.cluster_primary_security_group_id
    frontend_security_group_id                 = local.cluster_config_raw.frontend_security_group_id

    eso_iam_role_arns                          = jsondecode(local.cluster_config_raw.eso_iam_role_arns)

    kargo_external_secret_stores_iam_role_arn  = local.cluster_config_raw.kargo_external_secret_stores_iam_role_arn
  }
}
