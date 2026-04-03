data "terraform_remote_state" "eks_cluster" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/eks-cluster.tfstate"
    region = "us-west-2"
  }
}

data "terraform_remote_state" "codeai_k8s_dex" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s-dex/terraform.tfstate"
    region = "us-west-2"
  }
}
