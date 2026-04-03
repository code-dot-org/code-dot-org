locals {
  frontend_pod_security_group_ids = [
    local.cluster_primary_security_group_id,
    local.frontend_security_group_id,
  ]
}

resource "kubernetes_manifest" "frontend_security_group_policy" {
  for_each = local.frontend_security_group_namespaces

  manifest = {
    apiVersion = "vpcresources.k8s.aws/v1beta1"
    kind       = "SecurityGroupPolicy"
    metadata = {
      name      = "frontend-security-group"
      namespace = each.value
    }
    spec = {
      podSelector = {}
      securityGroups = {
        groupIds = local.frontend_pod_security_group_ids
      }
    }
  }

  depends_on = [module.eso_per_env]
}
