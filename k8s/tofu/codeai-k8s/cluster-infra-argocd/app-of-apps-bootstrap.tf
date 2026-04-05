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
    terraform_data.argocd_bootstrap,
  ]
}

# Work around the known cold-boot Argo/Dex/Kargo ordering issue:
# wait until Dex is reachable, restart Argo, then wait for Argo and Kargo.
resource "terraform_data" "wait_for_dex_after_bootstrap" {
  triggers_replace = [plantimestamp()]
  depends_on       = [kubectl_manifest.app_of_apps_bootstrap]

  provisioner "local-exec" {
    command = "'${path.module}/bin/wait-for-200' 'https://dex.k8s.code.org/.well-known/openid-configuration'"
  }
}

resource "terraform_data" "restart_argocd_server_after_dex" {
  triggers_replace = [plantimestamp()]
  depends_on       = [terraform_data.wait_for_dex_after_bootstrap]

  provisioner "local-exec" {
    command = <<-EOT
      '${path.module}/bin/kubectl-rollout-restart' \
        'deployment/argocd-server' \
        --namespace 'argocd' \
        --cluster-certificate-authority-data '${data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data}' \
        --cluster-endpoint '${local.cluster_endpoint}' \
        --cluster-name '${local.cluster_name}' \
        --cluster-region '${local.cluster_region}'
    EOT
  }
}

resource "terraform_data" "wait_for_argocd_after_restart" {
  triggers_replace = [plantimestamp()]
  depends_on       = [terraform_data.restart_argocd_server_after_dex]

  provisioner "local-exec" {
    command = "'${path.module}/bin/wait-for-200' 'https://argocd.k8s.code.org/'"
  }
}

resource "terraform_data" "wait_for_kargo_after_bootstrap" {
  triggers_replace = [plantimestamp()]
  depends_on       = [kubectl_manifest.app_of_apps_bootstrap]

  provisioner "local-exec" {
    command = "'${path.module}/bin/wait-for-200' 'https://kargo.k8s.code.org/'"
  }
}
