#===============================================================
# Bootstrap Argo CD itself from the default branch of k8s-gitops.
#
# The Ruby entrypoint owns the bootstrap-side Helm lifecycle:
#   - apply: install/bootstrap only; refuse Helm upgrades of an existing Argo
#   - destroy: reconcile Helm to latest git, then let Helm own final uninstall
#===============================================================

data "github_repository" "k8s_gitops" {
  full_name = "code-dot-org/k8s-gitops"
}

data "github_branch" "k8s_gitops_default" {
  repository = data.github_repository.k8s_gitops.name
  branch     = data.github_repository.k8s_gitops.default_branch
}

removed {
  from = terraform_data.argocd_bootstrap_checkout

  lifecycle {
    destroy = false
  }
}

removed {
  from = helm_release.argocd_bootstrap

  lifecycle {
    destroy = false
  }
}

# We bootsrap ArgoCD onto the cluster using helm. Why not use helm_release in tofu
# you ask? Why do this script monstrosity? Because ArgoCD actually manages itself
# after bootstrap, including upgrades etc. But it cannot delete itself because it
# stumbles and wedges as it deletes itself using itself. So we need helm to do the
# final deletion. OK, fine, helm_release would do that...right?
#
# BUT, ArgoCD has been upgrading and changing itself for... years? So the release
# might not delete all the NEW shaped pods etc in ArgoCD 2037 space edition.
#
# As a result, before the final `helm uninstall` we FIRST need to download the
# latest version of the chart (same version ArgoCD uses for itself), and helm upgrade.
# And to do that, my friends, requires a script. So its all script. Ugh, but whatevs,
# bootstrap is a little weird.
resource "terraform_data" "argocd_bootstrap" {
  input = {
    repo_url                           = "https://github.com/code-dot-org/k8s-gitops.git"
    default_branch                     = data.github_repository.k8s_gitops.default_branch
    argocd_chart_path                  = "apps/infra/argocd/chart"
    release_name                       = "argocd"
    namespace                          = "argocd"
    cluster_name                       = local.cluster_name
    cluster_region                     = local.cluster_region
    cluster_endpoint                   = local.cluster_endpoint
    cluster_certificate_authority_data = data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
  }

  depends_on = [
    terraform_data.legacy_helm_releases_complete,
  ]

  provisioner "local-exec" {
    command = <<-EOT
      '${path.module}/bin/argocd-bootstrap' \
        apply \
        --repo-url '${self.input.repo_url}' \
        --default-branch '${self.input.default_branch}' \
        --argocd-chart-path '${self.input.argocd_chart_path}' \
        --release-name '${self.input.release_name}' \
        --namespace '${self.input.namespace}' \
        --cluster-name '${self.input.cluster_name}' \
        --cluster-region '${self.input.cluster_region}' \
        --cluster-endpoint '${self.input.cluster_endpoint}' \
        --cluster-certificate-authority-data '${self.input.cluster_certificate_authority_data}'
    EOT
  }

  provisioner "local-exec" {
    when = destroy

    command = <<-EOT
      '${path.module}/bin/argocd-bootstrap' \
        destroy \
        --repo-url '${self.input.repo_url}' \
        --default-branch '${self.input.default_branch}' \
        --argocd-chart-path '${self.input.argocd_chart_path}' \
        --release-name '${self.input.release_name}' \
        --namespace '${self.input.namespace}' \
        --cluster-name '${self.input.cluster_name}' \
        --cluster-region '${self.input.cluster_region}' \
        --cluster-endpoint '${self.input.cluster_endpoint}' \
        --cluster-certificate-authority-data '${self.input.cluster_certificate_authority_data}'
    EOT
  }
}
