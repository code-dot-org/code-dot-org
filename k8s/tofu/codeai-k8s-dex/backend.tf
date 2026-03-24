terraform {
  backend "s3" {
    bucket       = "codeai-tofu-state"
    key          = "codeai-k8s-dex/terraform.tfstate"
    region       = "us-west-2"
    use_lockfile = true
  }
}
