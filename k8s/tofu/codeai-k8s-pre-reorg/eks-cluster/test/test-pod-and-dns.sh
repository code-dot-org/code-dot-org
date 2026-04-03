#!/usr/bin/env bash
set -euo pipefail

POD_NAME="test-dns-google"

cleanup() {
  kubectl delete pod "${POD_NAME}" -n default --ignore-not-found >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting DNS/ping smoke pod..."
kubectl delete pod "${POD_NAME}" -n default --ignore-not-found >/dev/null 2>&1 || true
kubectl run "${POD_NAME}" \
  -n default \
  --image=busybox:1.36 \
  --restart=Never \
  --command -- sh -c "nslookup google.com && ping -c 2 google.com" >/dev/null

echo "Waiting for pod to finish..."
for _ in {1..60}; do
  phase="$(kubectl get pod "${POD_NAME}" -n default -o jsonpath='{.status.phase}' 2>/dev/null || true)"
  if [[ "${phase}" == "Succeeded" ]]; then
    kubectl logs "${POD_NAME}" -n default | sed -n '1,30p'
    echo "PASS ✅: pod resolved DNS and pinged google.com."
    exit 0
  fi
  if [[ "${phase}" == "Failed" ]]; then
    kubectl logs "${POD_NAME}" -n default || true
    kubectl describe pod "${POD_NAME}" -n default | sed -n '1,160p'
    echo "FAIL ❌: pod failed DNS/ping check."
    exit 1
  fi
  sleep 2
done

kubectl logs "${POD_NAME}" -n default || true
kubectl describe pod "${POD_NAME}" -n default | sed -n '1,160p'
echo "FAIL ❌: timed out waiting for DNS/ping pod."
exit 1
