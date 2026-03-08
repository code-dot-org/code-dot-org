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

## Smoke Tests

Each of these takes about 5 minutes, but its nice to know stuff works ;-)

### Can we launch a pod and it can reach DNS?
```bash
./test/test-dns.sh
```

### Public Cluster Reachability

`PASS` means publicly reachable. `FAIL` means not reachable yet.

#### Test AWS Load Balancer Controller Ingresses Work (="public http works")

```bash
./test/test-ingress.sh
```

#### Test AWS NLB Works (="public IP services work")
```bash
./test/test-nlb.sh
```
