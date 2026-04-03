# cluster-infra-argocd

Creates Kubernetes-side resources (see `infra/`) and bootstraps ArgoCD with the app-of-apps.

## Pre-requisites

Apply `../cluster/` and `../cluster-infra/` first.

## Usage

Prerequisite: `../cluster/` and `../cluster-infra/` must already have been applied.

```bash
tofu init
AWS_PROFILE=codeorg-admin tofu apply
```

## Smoke tests

```bash
./test/test-external-secrets.sh
./test/test-ingress.sh
./test/test-nlb.sh
./test/test-gateway-http.sh
```
