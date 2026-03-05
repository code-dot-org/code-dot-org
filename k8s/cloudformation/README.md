# K8S / EKS Fargate Cluster Cloudformation Templates

Cloudformation templates to define our EKS Fargate k8s clusters,
aka prod-code-ai and nonprod-code-ai.

## Deploy and update

First deploy (create):

```bash
aws cloudformation deploy \
  --template-file k8s/cloudformation/eks-cluster.yml \
  --stack-name nonprod \
  --capabilities CAPABILITY_NAMED_IAM
```

Update (no repeated params; CloudFormation reuses prior values):

```bash
aws cloudformation deploy \
  --template-file k8s/cloudformation/eks-cluster.yml \
  --stack-name nonprod \
  --capabilities CAPABILITY_NAMED_IAM
```
