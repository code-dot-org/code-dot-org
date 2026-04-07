terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.28"
    }

    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.13.0, < 3.0.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.20.0"
    }

    kubectl = {
      source  = "alekc/kubectl"
      version = "~> 2.1"
    }

    http = {
      source  = "hashicorp/http"
      version = ">= 3.0.0"
    }
  }
}
