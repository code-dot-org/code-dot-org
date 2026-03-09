# eks-cluster

Creates the VPC subnets, NAT gateways, and EKS Fargate cluster.
Apply this first, before `eks-cluster-addons/`.

See `tofu.tfvars.example` to override defaults (region, VPC ID, CIDR blocks, etc.).

## Usage

```bash
tofu init

# Plan with read-only creds
AWS_PROFILE=cdo tofu plan -lock=false

# Apply requires admin (IAM roles are created)
AWS_PROFILE=codeorg-admin tofu apply
```

Configure `kubectl` to reach the new cluster:

```bash
aws eks update-kubeconfig --region us-east-1 --name "$(tofu output -raw cluster_name)"
```
