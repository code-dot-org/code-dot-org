# OpenTofu EKS Fargate Cluster

Recreation of ../../cloudformation/codeai-k8s.cloudformation.yml

See: `tofu.tfvars.example` if you need to change defaults

## Usage

From this directory:

```bash
tofu init
tofu plan
tofu apply
```

Configure `kubectl` to reach the new cluster:

```bash
aws eks update-kubeconfig --region us-east-1 --name "$(tofu output -raw cluster_name)"
```
