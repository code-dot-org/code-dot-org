terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.28"
    }

    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.13.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.24.0"
    }

    http = {
      source  = "hashicorp/http"
      version = ">= 3.4.0"
    }
  }
}
