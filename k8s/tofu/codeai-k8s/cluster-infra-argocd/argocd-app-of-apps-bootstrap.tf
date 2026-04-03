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
