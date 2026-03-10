terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.28"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "opentofu_state" {
  bucket = "seth-tmp-opentofu-state"

  tags = {
    Name    = "seth-tmp-opentofu-state"
    Managed = "OpenTofu"
    Purpose = "state"
  }
}

output "bucket_name" {
  description = "OpenTofu state bucket name"
  value       = aws_s3_bucket.opentofu_state.bucket
}
