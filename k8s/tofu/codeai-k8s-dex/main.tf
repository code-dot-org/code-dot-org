#============================================================
# Shared Google service account for Dex Google group lookups
#============================================================
#
# This service account already exists in GCP and is imported into OpenTofu state.
# Multiple clusters can share it.

resource "google_service_account" "dex_google_sso" {
  project      = var.google_cloud_project_id
  account_id   = "codeai-k8s-dex"
  display_name = "codeai-k8s-dex"
  description  = "Dex authentication service for codeai-k8s (aka k8s.code.org)"

  lifecycle {
    # This service account must be manually blessed by a Google Workspace super admin
    # for domain-wide delegation, so we should not destroy it casually.
    prevent_destroy = true
  }
}

resource "google_service_account_key" "dex_google_sso" {
  service_account_id = google_service_account.dex_google_sso.name
  private_key_type   = "TYPE_GOOGLE_CREDENTIALS_FILE"
}
