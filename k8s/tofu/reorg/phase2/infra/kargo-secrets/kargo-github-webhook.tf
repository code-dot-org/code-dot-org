#============================================================
# Kargo GitHub organization webhook resource
#============================================================
#
# This creates a GitHub organization webhook for push + package events.
# The shared secret is bootstrapped in phase2 and synced into Kubernetes in
# phase3.

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
