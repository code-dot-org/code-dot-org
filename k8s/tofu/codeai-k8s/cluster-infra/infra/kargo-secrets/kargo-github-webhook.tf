#============================================================
# Kargo GitHub organization webhook resource
#============================================================
#
# This creates a GitHub organization webhook for push + package events.
# The shared secret is bootstrapped in cluster-infra and synced into Kubernetes
# in cluster-infra-argocd.
#
# Why org level? This allows a single webhook to work for ghcr.io, the
# code-dot-org repo, and the k8s-gitops repo. The cost is that apply needs org
# webhook permissions. If that becomes too annoying, this can be split into
# several narrower webhooks later.

resource "github_organization_webhook" "kargo" {
  active = true
  events = ["package", "push"]

  configuration {
    # Mirrors Kargo's buildWebhookPath() for a cluster-scoped receiver:
    # sha256(project + receiverName + secret), where project is empty.
    url          = "https://kargo.${var.cluster_subdomain}/webhooks/github/${sha256("github-org-webhook${module.kargo_github_org_webhook_secret.secret_value}")}"
    content_type = "json"
    secret       = module.kargo_github_org_webhook_secret.secret_value
    insecure_ssl = false
  }
}
