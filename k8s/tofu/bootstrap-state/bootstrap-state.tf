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

resource "aws_s3_bucket_versioning" "opentofu_state" {
  bucket = aws_s3_bucket.opentofu_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "opentofu_state" {
  bucket = aws_s3_bucket.opentofu_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "opentofu_state" {
  bucket = aws_s3_bucket.opentofu_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  description = "OpenTofu state bucket name"
  value       = aws_s3_bucket.opentofu_state.bucket
}
