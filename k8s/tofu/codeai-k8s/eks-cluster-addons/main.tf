data "terraform_remote_state" "eks_cluster" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/eks-cluster.tfstate"
    region = "us-west-2"
  }
}

locals {
  cluster_name                       = data.terraform_remote_state.eks_cluster.outputs.cluster_name
  cluster_endpoint                   = data.terraform_remote_state.eks_cluster.outputs.cluster_endpoint
  cluster_certificate_authority_data = data.terraform_remote_state.eks_cluster.outputs.cluster_certificate_authority_data
  cluster_version                    = data.terraform_remote_state.eks_cluster.outputs.cluster_version
  oidc_provider_arn                  = data.terraform_remote_state.eks_cluster.outputs.oidc_provider_arn
  cluster_oidc_issuer_url            = data.terraform_remote_state.eks_cluster.outputs.cluster_oidc_issuer_url
  vpc_id                             = data.terraform_remote_state.eks_cluster.outputs.vpc_id
}
