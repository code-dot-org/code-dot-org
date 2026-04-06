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

### MacOS users

In some conditions, if a DNS lookup fails, MacOS' local DNS cache will refuse to check
the remote NS for 30 minutes, ignoring previous TTLs on the value. This can cause
tofu to fail, because we wait for https://dex.k8s.code.org to come up to declare
a succesful release.

As a workaround, run this in a terminal while running `tofu apply`:
```
while true; do
  echo "[$(date)] flushing macOS DNS cache"
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder
  sleep 10
done
```

## Smoke tests

```bash
./test/test-external-secrets.sh
./test/test-ingress.sh
./test/test-nlb.sh
./test/test-gateway-http.sh
```
