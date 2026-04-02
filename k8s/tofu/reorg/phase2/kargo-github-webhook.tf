#============================================================
# Kargo GitHub organization webhook resource
#============================================================
#
# This creates a GitHub organization webhook for push + package events.
# The shared secret is bootstrapped in phase2 and synced into Kubernetes in
# phase3.

locals {
  kargo_github_webhook_receiver_name = "github-org-webhook"
  kargo_external_webhooks_base_url   = "https://kargo.${local.cluster_subdomain}/webhooks"
  # Mirrors Kargo's buildWebhookPath() for a cluster-scoped receiver:
  # sha256(project + receiverName + secret), where project is empty.
  kargo_github_webhook_path_hash    = sha256("${local.kargo_github_webhook_receiver_name}${module.kargo_github_org_webhook_secret.secret_value}")
  kargo_github_webhook_receiver_url = "${local.kargo_external_webhooks_base_url}/github/${local.kargo_github_webhook_path_hash}"
}

resource "github_organization_webhook" "kargo" {
  active = true
  events = ["package", "push"]

  configuration {
    url          = local.kargo_github_webhook_receiver_url
    content_type = "json"
    secret       = module.kargo_github_org_webhook_secret.secret_value
    insecure_ssl = false
  }
}
