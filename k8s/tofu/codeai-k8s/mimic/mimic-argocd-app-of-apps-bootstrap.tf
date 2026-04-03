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

# app-of-apps manages itself, which leads to its parent self refusing to delete, because
# its child self is not done deleting. Therefore, we patch out the finalizers first,
# as per argo docs: https://argo-cd.readthedocs.io/en/latest/user-guide/app_deletion/#deletion-using-kubectl
resource "terraform_data" "strip_finalizers_before_delete" {
  input = {
    application_name                   = "mimic-app-of-apps"
    cluster_certificate_authority_data = data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
    cluster_name                       = local.cluster_name
    cluster_endpoint                   = local.cluster_endpoint
    cluster_region                     = local.cluster_region
  }

  depends_on = [kubectl_manifest.mimic_app_of_apps_applicationset]

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
