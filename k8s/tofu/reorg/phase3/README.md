# phase3

Creates Kubernetes-side resources (see `infra/`) and bootstraps ArgoCD with the app-of-apps.

## Pre-requisites

Apply `../phase1/` and `../phase2/` first.

## Usage

Prerequisite: `../phase1/` and `../phase2/` must already have been applied.

```bash
# Run `helm dependency build` in each chart sub-dir:
find ./infra -mindepth 1 -maxdepth 1 -type d -exec sh -c 'cd "$1" && helm dependency build >/dev/null 2>&1 || true' _ {} \;

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
