variable "google_cloud_project_id" {
  description = "Google Cloud project ID where the shared Dex service account is created and managed."
  type        = string
  # code.org org:
  default     = "api-project-254945981659"
}

variable "google_email_with_groups_readonly_scope" {
  description = "Google Workspace user Dex impersonates for group lookups. This user needs at least the Groups Reader role."
  type        = string
}

variable "google_workspace_domains" {
  description = "Google Workspace domains allowed to sign in via Dex."
  type        = list(string)
  default     = ["code.org"]
}
