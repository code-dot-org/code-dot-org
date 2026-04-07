terraform {
  backend "s3" {
    bucket       = "codeai-tofu-state"
    key          = "codeai-k8s/clusters/non-prod/cluster-infra-argocd.tfstate"
    region       = "us-west-2"
    use_lockfile = true
  }
}
