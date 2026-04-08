data "terraform_remote_state" "cluster" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/clusters/non-prod/cluster.tfstate"
    region = "us-west-2"
  }
}

locals {
  cluster_outs = data.terraform_remote_state.cluster.outputs

  cluster_name     = local.cluster_outs.cluster_name
  cluster_endpoint = local.cluster_outs.cluster_endpoint
  cluster_region   = local.cluster_outs.cluster_region
}

provider "aws" {
  region = local.cluster_region
  default_tags {
    tags = {
      "environment-type" = "k8s"
    }
  }
}

provider "github" {
  owner = "code-dot-org"
}

provider "kubernetes" {
  host = local.cluster_endpoint
  cluster_ca_certificate = base64decode(
    data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
  )

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--region", local.cluster_region, "--cluster-name", local.cluster_name]
  }
}

data "aws_eks_cluster_auth" "this" {
  name = local.cluster_name
}

provider "kubectl" {
  host = local.cluster_endpoint
  cluster_ca_certificate = base64decode(
    data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
  )
  token            = data.aws_eks_cluster_auth.this.token
  load_config_file = false
}

provider "helm" {
  kubernetes {
    host = local.cluster_endpoint
    cluster_ca_certificate = base64decode(
      data.terraform_remote_state.cluster.outputs.cluster_certificate_authority_data
    )

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--region", local.cluster_region, "--cluster-name", local.cluster_name]
    }
  }
}
