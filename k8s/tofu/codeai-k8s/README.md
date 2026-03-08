# OpenTofu EKS Fargate Cluster

Recreation of ../../cloudformation/codeai-k8s.cloudformation.yml

## Usage

From this directory:

```bash
tofu init
tofu plan -var-file=tofu.tfvars
tofu apply -var-file=tofu.tfvars
```

If you are just starting, copy `tofu.tfvars.example` to `tofu.tfvars` and adjust values as needed.

Configure `kubectl` to reach the new cluster:

```bash
CLUSTER_NAME=codeai-k8s
aws eks update-kubeconfig --region us-east-1 --name "$CLUSTER_NAME"
```
