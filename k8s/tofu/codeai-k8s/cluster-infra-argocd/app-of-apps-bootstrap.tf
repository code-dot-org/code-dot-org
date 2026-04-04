#===============================================================
# Bootstrap the Argo CD app-of-apps wrapper Application from GitHub.
#
# That Application then manages apps/app-of-apps/app-of-apps.yaml from
# k8s-gitops.
#===============================================================

data "github_repository_file" "argocd_app_of_apps_application" {
  repository = "code-dot-org/k8s-gitops"
  branch     = data.github_repository.k8s_gitops.default_branch
  file       = "apps/app-of-apps/bootstrap.yaml"
}

resource "terraform_data" "legacy_helm_releases_complete" {
  count = var.deploy_helm_charts ? 1 : 0

  # If the legacy Helm path is explicitly re-enabled, keep the old tofu-side
  # sequencing before we hand off to app-of-apps.
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

resource "kubectl_manifest" "app_of_apps_bootstrap" {
  yaml_body = data.github_repository_file.argocd_app_of_apps_application.content

  server_side_apply = true
  field_manager     = "terraform"

  # On deletion, don't consider this module deleted until k8s async resources cleanup.
  # If applicationset.yaml finalizers are set right on Argo, this should mean destroying
  # the whole app-of-apps chain of deps and waiting for it, which is good because if we delete
  # the CRDs before CRD users are deleted, we'll get finalizer infinity-hangs.
  wait = true

  depends_on = [
    helm_release.argocd_bootstrap,
    terraform_data.legacy_helm_releases_complete,
  ]
}

# Work around the known first-boot Argo/Dex SSO issue in k8s/TODO.md:
# after a fresh deploy, argocd-server can start once before its Dex-backed
# OIDC state is fully usable, and a clean rollout restart fixes login.
resource "terraform_data" "restart_argocd_server_after_bootstrap" {
  triggers_replace = [
    data.github_branch.k8s_gitops_default.sha,
    sha256(data.github_repository_file.argocd_app_of_apps_application.content),
  ]

  input = {
    cluster_certificate_authority_data = data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
    cluster_name                       = local.cluster_name
    cluster_endpoint                   = local.cluster_endpoint
    cluster_region                     = local.cluster_region
    namespace                          = "argocd"
    deployment_name                    = "argocd-server"
  }

  depends_on = [
    kubectl_manifest.app_of_apps_bootstrap,
  ]

  provisioner "local-exec" {
    command = <<-EOT
      bash '${path.module}/../bin/rollout-restart-deployment.sh' \
        '${self.input.cluster_certificate_authority_data}' \
        '${self.input.cluster_endpoint}' \
        '${self.input.cluster_name}' \
        '${self.input.cluster_region}' \
        '${self.input.namespace}' \
        '${self.input.deployment_name}'
    EOT
  }
}
