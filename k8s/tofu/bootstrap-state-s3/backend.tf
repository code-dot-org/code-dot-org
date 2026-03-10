terraform {
  backend "s3" {
    bucket       = "seth-tmp-opentofu-state"
    key          = "k8s/tofu/bootstrap-state-s3/tofu.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
