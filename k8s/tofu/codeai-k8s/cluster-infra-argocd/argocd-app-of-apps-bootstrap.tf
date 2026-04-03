#===============================================================
# Bootstrap the Argo CD app-of-apps ApplicationSet from GitHub.
#
# Argo CD will then self-manage this manifest from k8s-gitops.
#===============================================================

data "github_repository_file" "argocd_app_of_apps_applicationset" {
  repository = "code-dot-org/k8s-gitops"
  branch     = "main"
  file       = "apps/app-of-apps/applicationset.yaml"
}

resource "kubectl_manifest" "argocd_app_of_apps_applicationset" {
  yaml_body = data.github_repository_file.argocd_app_of_apps_applicationset.content

  server_side_apply = true
  field_manager     = "terraform"

  # On deletion, don't consider this module deleted until k8s async resources cleanup.
  # If applicationset.yaml finalizers are set right on Argo, this should mean destroying
  # the whole app-of-apps chain of deps and waiting for it, which is good because if we delete
  # the CRDs before CRD users are deleted, we'll get finalizer infinity-hangs.
  wait              = true

  # Don't boot app-of-apps until we're completely done on the tofu side of things
  depends_on = [
    helm_release.networking,
    helm_release.external_secrets_operator,
    helm_release.argocd,
    helm_release.external_dns,
    helm_release.dex,
    helm_release.kargo_secrets,
    helm_release.standard_envtypes,
  ]
}

# app-of-apps manages itself, which leads to its parent self refusing to delete, because
# its child self is not done deleting. Therefore, we patch out the finalizers first,
# as per argo docs: https://argo-cd.readthedocs.io/en/latest/user-guide/app_deletion/#deletion-using-kubectl
resource "terraform_data" "strip_finalizers_before_delete" {
  input = {
    application_name                   = "app-of-apps"
    cluster_certificate_authority_data = data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
    cluster_name                       = local.cluster_name
    cluster_endpoint                   = local.cluster_endpoint
    cluster_region                     = local.cluster_region
  }

  depends_on = [kubectl_manifest.argocd_app_of_apps_applicationset]

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      nohup timeout 10m bash '${path.module}/../bin/strip-finalizers-before-delete.sh' \
        "$PPID" \
        '${self.input.application_name}' \
        '${self.input.cluster_certificate_authority_data}' \
        '${self.input.cluster_endpoint}' \
        '${self.input.cluster_name}' \
        '${self.input.cluster_region}' \
        >'${path.module}/strip-finalizers-before-delete.log' 2>&1 </dev/null &
      exit 0
    EOT
  }
}
