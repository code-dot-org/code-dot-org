data "terraform_remote_state" "cluster" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/clusters/non-prod/cluster.tfstate"
    region = "us-west-2"
  }
}

data "terraform_remote_state" "codeai_k8s_dex" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/cross-cluster/dex.tfstate"
    region = "us-west-2"
  }
}
