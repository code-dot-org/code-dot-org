data "terraform_remote_state" "phase1" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/reorg/phase1.tfstate"
    region = "us-west-2"
  }
}

locals {
  cluster_outs   = data.terraform_remote_state.phase1.outputs
  cluster_config = data.kubernetes_config_map_v1.codeai_cluster_config.data

  cluster_name     = local.cluster_outs.cluster_name
  cluster_endpoint = local.cluster_outs.cluster_endpoint
  cluster_region   = local.cluster_outs.cluster_region

  single_namespace_environment_types         = toset(jsondecode(local.cluster_config.single_namespace_environment_types))
  frontend_security_group_namespaces         = toset(jsondecode(local.cluster_config.frontend_security_group_namespaces))
  cluster_primary_security_group_id          = local.cluster_config.cluster_primary_security_group_id
  frontend_security_group_id                 = local.cluster_config.frontend_security_group_id
  cluster_subdomain_wildcard_certificate_arn = local.cluster_config.cluster_subdomain_wildcard_certificate_arn
  eso_iam_role_arns                          = jsondecode(local.cluster_config.eso_iam_role_arns)
  kargo_external_secret_stores_iam_role_arn  = local.cluster_config.kargo_external_secret_stores_iam_role_arn
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
    data.terraform_remote_state.phase1.outputs.cluster_certificate_authority_data
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
    data.terraform_remote_state.phase1.outputs.cluster_certificate_authority_data
  )
  token            = data.aws_eks_cluster_auth.this.token
  load_config_file = false
}

provider "helm" {
  kubernetes {
    host = local.cluster_endpoint
    cluster_ca_certificate = base64decode(
      data.terraform_remote_state.phase1.outputs.cluster_certificate_authority_data
    )

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--region", local.cluster_region, "--cluster-name", local.cluster_name]
    }
  }
}
