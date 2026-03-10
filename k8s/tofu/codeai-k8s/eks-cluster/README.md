# eks-cluster

Creates the EKS Fargate cluster along with required VPC subnets, NAT gateways, IAM.
Apply this first, before `../eks-cluster-addons/`.

See `tofu.tfvars.example` to override defaults (region, VPC ID, CIDR blocks, etc.).

## Usage

```bash
tofu init

# Apply requires admin (IAM roles are created)
AWS_PROFILE=codeorg-admin tofu apply
```

Configure `kubectl` to reach the new cluster:

```bash
aws eks update-kubeconfig --region us-east-1 --name "$(tofu output -raw cluster_name)"
```

## Smoke Tests

### Can you start a Pod and can it reach DNS?

Takes a few minutes cause fargate is slooooow.

```bash
./test/test-pod-and-dns.sh
```
