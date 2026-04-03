terraform {
  backend "s3" {
    bucket       = "codeai-tofu-state"
    key          = "codeai-k8s/cluster.tfstate"
    region       = "us-west-2"
    use_lockfile = true
  }
}
