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

  depends_on = [helm_release.argocd]
}
