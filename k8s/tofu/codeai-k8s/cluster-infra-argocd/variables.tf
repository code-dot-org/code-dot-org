variable "deploy_helm_charts" {
  description = "Whether to deploy the legacy Helm releases in helm.tf from this module."
  type        = bool
  default     = false
  nullable    = false
}
