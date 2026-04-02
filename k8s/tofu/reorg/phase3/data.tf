data "terraform_remote_state" "phase1" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/reorg/phase1.tfstate"
    region = "us-west-2"
  }
}

data "terraform_remote_state" "phase2" {
  backend = "s3"
  config = {
    bucket = "codeai-tofu-state"
    key    = "codeai-k8s/reorg/phase2.tfstate"
    region = "us-west-2"
  }
}
