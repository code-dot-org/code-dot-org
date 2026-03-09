#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

cleanup() {
  kubectl delete -f test-ingress.yaml --ignore-not-found >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Applying test-ingress resources..."
kubectl apply -f test-ingress.yaml >/dev/null
kubectl wait --for=condition=available deployment/hello -n default --timeout=180s >/dev/null

echo "Waiting for ALB hostname..."
host=""
for _ in {1..60}; do
  host="$(kubectl get ingress hello -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)"
  if [[ -n "${host}" ]]; then
    break
  fi
  sleep 3
done

if [[ -z "${host}" ]]; then
  kubectl describe ingress hello -n default | sed -n '1,120p'
  echo "FAIL: ingress hostname not assigned."
  exit 1
fi

echo "Ingress host: ${host}"
echo "Waiting for HTTP 200..."
for _ in {1..60}; do
  if curl -fsS --max-time 5 "http://${host}/" >/tmp/hello-ingress-response.txt 2>/dev/null; then
    echo "Response sample:"
    sed -n '1,3p' /tmp/hello-ingress-response.txt
    echo "PASS: ingress is publicly reachable."
    exit 0
  fi
  sleep 3
done

kubectl get ingress hello -n default -o wide
echo "FAIL: ingress hostname exists but HTTP was not reachable."
exit 1
