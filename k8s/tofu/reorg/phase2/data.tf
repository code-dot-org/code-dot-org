data "terraform_remote_state" "phase1" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/reorg/phase1.tfstate"
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
