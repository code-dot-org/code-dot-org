#===============================================================
# Bootstrap the Argo CD mimic root ApplicationSet from GitHub.
#
# Argo CD will then manage the mimic tree from k8s-gitops.
#===============================================================

data "github_repository_file" "mimic_app_of_apps_applicationset" {
  repository = "code-dot-org/k8s-gitops"
  branch     = "main"
  file       = "mimic/apps/app-of-apps/applicationset.yaml"
}

resource "kubectl_manifest" "mimic_app_of_apps_applicationset" {
  yaml_body = data.github_repository_file.mimic_app_of_apps_applicationset.content

  server_side_apply = true
  field_manager     = "terraform"

  # On deletion, don't consider this module deleted until k8s async resources cleanup.
  # This mirrors the real app-of-apps bootstrap path and waits for Argo-side teardown.
  wait = true
}
