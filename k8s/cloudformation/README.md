# K8S / EKS Fargate Cluster Cloudformation Templates

Cloudformation templates to define our EKS Fargate k8s clusters, aka codeai-k8s.

# Setting up a cluster from scratch:

## First, create cloudformation stack

Either upload [codeai-k8s.cloudformation.yaml](./codeai-k8s.cloudformation.yaml) 
in the CloudFormation AWS console (Create Stack), or use the command line.

Stack name will be the EKS cluster name, we suggest STACK_NAME=codeai-k8s, at least as a suffix.

```bash
STACK_NAME=codeai-k8s \
aws cloudformation deploy \
  --template-file ./codeai-k8s.cloudformation.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_NAMED_IAM
```

## Second, download kubectl credentials for your new EKS cluster

Configure kubectl to reach your new cluster:
```
STACK_NAME=codeai-k8s
aws eks update-kubeconfig --region us-east-1 --name "$STACK_NAME"
```

To verify it works, you should now be able to run:
```
kubectl get ns
```

## Third, restart CoreDNS on the cluster

Annoyingly, EKS Fargate deploys clusters in a broken state by default. To fix it,
per official AWS instructions, you gotta restart the k8s coredns service, run:
```
kubectl rollout restart -n kube-system deployment coredns
```

Then wait until coredns restarts (~2 minutes?), this command will block until its ready:
```
kubectl -n kube-system rollout status deployment/coredns --timeout=10m
```

## Fourth, run helmfile

We use [helmfile](https://github.com/helmfile/helmfile) to quickly inject some useful 
helm charts into our cluster, in particular we start the AWS Load Balancer Controller.

From this directory:

```bash
helmfile sync
```
