provider "aws" {
  region = local.cluster_region
  default_tags {
    tags = {
      "environment-type" = "k8s"
    }
  }
}

provider "kubernetes" {
  host                   = local.cluster_endpoint
  cluster_ca_certificate = base64decode(
    data.terraform_remote_state.eks_cluster.outputs.cluster_certificate_authority_data
  )

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--region", local.cluster_region, "--cluster-name", local.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = local.cluster_endpoint
    cluster_ca_certificate = base64decode(
      data.terraform_remote_state.eks_cluster.outputs.cluster_certificate_authority_data
    )

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--region", local.cluster_region, "--cluster-name", local.cluster_name]
    }
  }
}
