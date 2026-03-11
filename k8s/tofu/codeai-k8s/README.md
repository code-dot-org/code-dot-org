# OpenTofu EKS Fargate Cluster

This directory contains two OpenTofu root modules. Apply them in order:

1. **[eks-cluster/](eks-cluster/README.md)** — VPC networking + EKS cluster
2. **[eks-cluster-addons/](eks-cluster-addons/README.md)** — AWS Load Balancer Controller, External Secrets Operator, etc
