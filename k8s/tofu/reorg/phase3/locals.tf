# Only locals used in multiple .tf files should live here.
locals {
  cluster_outs = data.terraform_remote_state.phase1.outputs
  phase2_outs  = data.terraform_remote_state.phase2.outputs

  cluster_name     = local.cluster_outs.cluster_name
  cluster_endpoint = local.cluster_outs.cluster_endpoint
  cluster_region   = local.cluster_outs.cluster_region
  vpc_id           = local.cluster_outs.vpc_id

  cluster_primary_security_group_id  = local.cluster_outs.cluster_primary_security_group_id
  frontend_security_group_id         = local.cluster_outs.frontend_security_group_id
  frontend_security_group_namespaces = toset(local.cluster_outs.frontend_security_group_namespaces)

  ingress_certificate_arn = local.phase2_outs.cluster_subdomain_wildcard_certificate_arn

  single_namespace_environment_types = toset(local.cluster_outs.single_namespace_environment_types)
}
