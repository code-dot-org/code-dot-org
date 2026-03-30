variable "aws_secret_name" {
  description = "AWS Secrets Manager secret name."
  type        = string
}

variable "secret_value_to_bootstrap" {
  description = "Optional bootstrap secret value to write before reading the current version back."
  type        = string
  sensitive   = true
  default     = null
}
