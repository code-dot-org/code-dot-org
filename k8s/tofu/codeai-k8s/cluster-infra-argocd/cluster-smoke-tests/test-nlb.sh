#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../test && pwd)"
cd "$TEST_DIR"

cleanup() {
  kubectl delete -f test-nlb.yaml --ignore-not-found >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Applying test-nlb resources..."
kubectl apply -f test-nlb.yaml >/dev/null
kubectl wait --for=condition=available deployment/hello-nlb -n default --timeout=180s >/dev/null

echo "Waiting for NLB hostname..."
host=""
for _ in {1..60}; do
  host="$(kubectl get service hello-nlb -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)"
  if [[ -n "${host}" ]]; then
    break
  fi
  sleep 3
done

if [[ -z "${host}" ]]; then
  kubectl describe service hello-nlb -n default | sed -n '1,140p'
  echo "FAIL ❌: NLB hostname not assigned."
  exit 1
fi

echo "NLB host: ${host}"
echo "Waiting for HTTP 200..."
for _ in {1..60}; do
  if curl -fsS --max-time 5 "http://${host}/" >/tmp/hello-nlb-response.txt 2>/dev/null; then
    echo "Response sample:"
    sed -n '1,3p' /tmp/hello-nlb-response.txt
    echo "PASS ✅: NLB service is publicly reachable."
    exit 0
  fi
  sleep 3
done

kubectl get service hello-nlb -n default -o wide
echo "FAIL ❌: NLB hostname exists but HTTP was not reachable."
exit 1
