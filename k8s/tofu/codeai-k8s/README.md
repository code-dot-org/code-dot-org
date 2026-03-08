# OpenTofu EKS Fargate Cluster

This OpenTofu root reproduces the `codeai-k8s` EKS Fargate cluster currently defined in
[`../../cloudformation/codeai-k8s.cloudformation.yaml`](../../cloudformation/codeai-k8s.cloudformation.yaml), while also absorbing
what [`../../cloudformation/helmfile.yaml.gotmpl`](../../cloudformation/helmfile.yaml.gotmpl) currently installs after cluster creation.

The OpenTofu path keeps everything in one root:
- network resources inside the existing VPC
- EKS control plane and fallback Fargate profile
- engineering access entries
- IRSA role for the AWS Load Balancer Controller
- Helm release for the AWS Load Balancer Controller

## Prerequisites

You need these installed and configured locally:
- `tofu`
- AWS CLI credentials that can create IAM, networking, EKS, and Helm-backed cluster resources
- `kubectl`

## Usage

From this directory:

```bash
tofu init
tofu plan -var-file=tofu.tfvars
tofu apply -var-file=tofu.tfvars
```

Before initializing this root for the first time, bootstrap the remote state bucket in
[`../bootstrap-state`](../bootstrap-state):

```bash
cd ../bootstrap-state
tofu init
tofu apply
cd ../codeai-k8s
```

If you are just starting, copy `tofu.tfvars.example` to `tofu.tfvars` and adjust values as needed.

Configure `kubectl` to reach the new cluster:

```bash
CLUSTER_NAME=codeai-k8s
aws eks update-kubeconfig --region us-east-1 --name "$CLUSTER_NAME"
```

## Notes

This OpenTofu root uses the Helm provider directly instead of Helmfile.

Because the Helm provider talks to the cluster being created in the same root, the first bootstrap
may require running `tofu apply` a second time if the provider cannot initialize cleanly until the
EKS control plane is active.

This root automatically restarts CoreDNS after the cluster is created and waits for the rollout to
finish. That preserves the CloudFormation path's manual CoreDNS fix inside the OpenTofu workflow.

To verify the AWS Load Balancer Controller was installed:

```bash
kubectl -n kube-system get deployment aws-load-balancer-controller
kubectl -n kube-system get serviceaccount aws-load-balancer-controller -o yaml
```

This root uses the S3 bucket `seth-tmp-opentofu-state` for remote state and OpenTofu's native S3
lockfile support (`use_lockfile = true`).

The CloudFormation + Helmfile flow in the parent directory remains supported and unchanged.
