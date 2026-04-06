# OpenTofu `codeai-k8s` kubernetes cluster

This creates a full codeai-k8s cluster on EKS, and bootstraps
the full gitops repo into being: https://github.com/code-dot-org/k8s-gitops

Tofu modules should be applied in this order:

0. If this is the first cluster:  `../codeai-k8s-dex` 
1. `cluster`: the eks cluster, vpc and networking
2. `cluster-infra`: aws objects like IAM roles
3. `cluster-infra-argocd`: bootstraps argocd, which loads https://github.com/code-dot-org/k8s-gitops
