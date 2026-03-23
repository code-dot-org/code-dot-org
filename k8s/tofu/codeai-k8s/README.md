# OpenTofu EKS Fargate Cluster

This directory contains two OpenTofu root modules. Apply them in order:

1. **[eks-cluster/](eks-cluster/README.md)** — EKS cluster + VPC networking
2. **[eks-cluster-addons/](eks-cluster-addons/README.md)** — AWS Load Balancer Controller, External Secrets Operator, etc

## Org-wide bootstrap: only needed once

Only required if you're starting on a fresh account, not needed for each cluster.

1. **[codeai-k8s-dex/](codeai-k8s-dex/README.md)** - shared between clusters, only need to apply if this is the first cluster in the org
