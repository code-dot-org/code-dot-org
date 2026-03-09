terraform {
  backend "s3" {
    bucket       = "seth-tmp-opentofu-state"
    key          = "codeai-k8s/eks-cluster-addons.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
