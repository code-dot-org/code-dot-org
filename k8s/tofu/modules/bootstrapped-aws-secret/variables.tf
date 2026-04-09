variable "aws_secret_name" {
  description = "AWS Secrets Manager secret name."
  type        = string
}

variable "secret_value_to_bootstrap" {
  description = "Optional bootstrap secret value to write before reading the current version back."
  type        = string
  sensitive   = true
  default     = null

  validation {
    condition     = !(var.secret_value_to_bootstrap != null && var.bootstrap_with_random_value)
    error_message = "Set either secret_value_to_bootstrap or bootstrap_with_random_value, not both."
  }
}

variable "bootstrap_with_random_value" {
  description = "Whether to bootstrap the secret with a generated random value."
  type        = bool
  default     = false
}
