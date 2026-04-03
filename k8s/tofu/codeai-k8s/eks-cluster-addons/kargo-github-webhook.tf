#============================================================
# Kargo GitHub organization webhook resource
#============================================================
#
# This creates a GitHub organization webhook for push + package events.
# The shared secret is managed separately in kargo-github-webhook-secret.tf.

locals {
  kargo_github_webhook_receiver_name   = "github-org-webhook"
  kargo_github_webhook_secret_name     = "github-org-webhook-secret"
  kargo_github_webhook_secret_aws_name = "${local.kargo_secret_prefix}/github_org_webhook_secret"
  kargo_external_webhooks_base_url     = "https://${local.kargo_hostname}/webhooks"
  # Mirrors Kargo's buildWebhookPath() for a cluster-scoped receiver:
  # sha256(project + receiverName + secret), where project is empty.
  kargo_github_webhook_path_hash    = sha256("${local.kargo_github_webhook_receiver_name}${module.kargo_github_org_webhook_secret.secret_value}")
  kargo_github_webhook_receiver_url = "${local.kargo_external_webhooks_base_url}/github/${local.kargo_github_webhook_path_hash}"
}


#==============================================================
# Configure a new org-level github webhook for kargo
#
# Why org level? This allows a single webhook to work for
# ghcr.io, AND code-dot-org repo, AND k8s-gitops repo.
# The only annoying thing is that you need org level access
# to do the tofu apply, it wouldn't be hard to make 3 webhooks
# instead if this was deemed too annoying (e.g. we wanted to
# apply opentofu in our CI, but we didn't want to give our
# CI access to a PAT with this access level).
#
#==============================================================

resource "github_organization_webhook" "kargo" {
  provider = github.code_dot_org

  active = true
  events = ["package", "push"]

  configuration {
    url          = local.kargo_github_webhook_receiver_url
    content_type = "json"
    secret       = module.kargo_github_org_webhook_secret.secret_value
    insecure_ssl = false
  }
}
