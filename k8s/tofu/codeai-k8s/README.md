# OpenTofu EKS Fargate Cluster

Recreation of ../../cloudformation/codeai-k8s.cloudformation.yml

See: `tofu.tfvars.example` if you need to change defaults

## Usage

From this directory:

```bash
tofu init

# Make a plan with read-only creds
AWS_PROFILE=cdo tofu plan -lock=false

# Executing the plan requires admin (not cdo-readwrite) because it adds IAM roles
AWS_PROFILE=codeorg-admin tofu apply
```

Configure `kubectl` to reach the new cluster:

```bash
aws eks update-kubeconfig --region us-east-1 --name "$(tofu output -raw cluster_name)"
```
