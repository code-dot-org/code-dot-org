terraform {
  backend "s3" {
    bucket       = "codeai-tofu-state"
    key          = "codeai-k8s/cross-cluster/dex.tfstate"
    region       = "us-west-2"
    use_lockfile = true
  }
}
