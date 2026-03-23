output "google_email_with_groups_readonly_scope" {
  value = var.google_email_with_groups_readonly_scope
}

output "google_workspace_domains" {
  value = var.google_workspace_domains
}

output "google_service_account_client_id" {
  value = google_service_account.dex_google_sso.unique_id
}

output "google_service_account_key_json" {
  value     = base64decode(google_service_account_key.dex_google_sso.private_key)
  sensitive = true
}
