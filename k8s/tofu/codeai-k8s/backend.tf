terraform {
  backend "s3" {
    bucket       = "seth-tmp-opentofu-state"
    key          = "k8s/tofu/codeai-k8s/tofu.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
