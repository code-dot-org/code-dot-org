# phase3

Creates Kubernetes-side resources (see `infra/`) and bootstraps ArgoCD with the app-of-apps.

## Pre-requisites

Apply `../phase1/` and `../phase2/` first.

## Usage

Prerequisite: `../phase1/` and `../phase2/` must already have been applied.

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
