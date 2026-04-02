resource "kubernetes_manifest" "frontend_security_group_policy" {
  for_each = toset(local.cluster_outs.frontend_security_group_namespaces)

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
        groupIds = [
          local.cluster_outs.cluster_primary_security_group_id,
          local.cluster_outs.frontend_security_group_id,
        ]
      }
    }
  }

  depends_on = [helm_release.eso_per_env]
}
