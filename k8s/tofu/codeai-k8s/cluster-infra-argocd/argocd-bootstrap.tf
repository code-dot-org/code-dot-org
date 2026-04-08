#===============================================================
# Bootstrap Argo CD itself from the default branch of k8s-gitops.
#
# After this initial install, Argo CD will self-manage the same chart
# from apps/infra/argocd/chart in the gitops repo.
#===============================================================

data "github_repository" "k8s_gitops" {
  full_name = "code-dot-org/k8s-gitops"
}

data "github_branch" "k8s_gitops_default" {
  repository = data.github_repository.k8s_gitops.name
  branch     = data.github_repository.k8s_gitops.default_branch
}

resource "terraform_data" "argocd_bootstrap_checkout" {
  triggers_replace = [
    data.github_repository.k8s_gitops.default_branch,
    data.github_branch.k8s_gitops_default.sha,
  ]

  provisioner "local-exec" {
    command = <<-EOT
      set -euo pipefail

      checkout_dir='${path.module}/.terraform/argocd-bootstrap-checkout'

      rm -rf "$checkout_dir"
      mkdir -p "$(dirname "$checkout_dir")"

      git clone \
        --depth 1 \
        --branch '${data.github_repository.k8s_gitops.default_branch}' \
        --filter=blob:none \
        --sparse \
        https://github.com/code-dot-org/k8s-gitops.git \
        "$checkout_dir"

      git -C "$checkout_dir" sparse-checkout set apps/infra/argocd
    EOT
  }
}

resource "helm_release" "argocd_bootstrap" {
  name             = "argocd"
  chart            = "${path.module}/.terraform/argocd-bootstrap-checkout/apps/infra/argocd/chart"
  namespace        = "argocd"
  create_namespace = true
  values = [
    yamlencode({
      # Blank-cluster bootstrap needs the one-time Redis secret-init hook.
      # The steady-state chart values in k8s-gitops disable it so self-managed
      # Argo does not keep resuming this hook on itself:
      # https://github.com/argoproj/argo-helm/issues/2887
      argo-cd = {
        redisSecretInit = {
          enabled = true
        }
      }
      _bootstrap = {
        k8s_gitops_revision = data.github_branch.k8s_gitops_default.sha
      }
    })
  ]

  lifecycle {
    ignore_changes = all
  }

  depends_on = [terraform_data.argocd_bootstrap_checkout]
}
