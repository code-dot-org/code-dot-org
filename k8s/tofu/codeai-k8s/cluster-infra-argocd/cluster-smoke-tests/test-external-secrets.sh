#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../test && pwd)"
cd "$TEST_DIR"

NAMESPACE="staging"
ADHOC_NAMESPACE="adhoc-addons-test-123"
SECRET_ONE="addons-test-staging-secret"
SECRET_TWO="addons-test-cfn-stack-staging-secret"
SECRET_THREE="addons-test-staging-cdo-fan-in-secret"
ADHOC_SECRET="addons-test-adhoc-secret"
POD_NAME="test-external-secrets-reader"

cleanup() {
  kubectl delete -f test-external-secrets-pod.yaml --ignore-not-found >/dev/null 2>&1 || true
  kubectl delete -f test-external-secrets.yaml --ignore-not-found >/dev/null 2>&1 || true
  kubectl delete secret "${SECRET_ONE}" "${SECRET_TWO}" "${SECRET_THREE}" -n "${NAMESPACE}" --ignore-not-found >/dev/null 2>&1 || true
  kubectl delete secret "${ADHOC_SECRET}" -n "${ADHOC_NAMESPACE}" --ignore-not-found >/dev/null 2>&1 || true
  kubectl delete namespace "${ADHOC_NAMESPACE}" --ignore-not-found >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_for_secret() {
  local namespace="$1"
  local secret_name="$2"
  local found=""

  for _ in {1..60}; do
    found="$(kubectl get secret "${secret_name}" -n "${namespace}" -o name 2>/dev/null || true)"
    if [[ -n "${found}" ]]; then
      echo "Found secret ✅: ${secret_name}"
      return 0
    fi
    sleep 2
  done

  return 1
}

echo "Applying ExternalSecret test resources..."
kubectl apply -f test-external-secrets.yaml >/dev/null

echo "Waiting for synced Kubernetes Secrets..."
for secret_name in "${SECRET_ONE}" "${SECRET_TWO}" "${SECRET_THREE}"; do
  if ! wait_for_secret "${NAMESPACE}" "${secret_name}"; then
    kubectl get externalsecret -n "${NAMESPACE}" || true
    kubectl describe externalsecret -n "${NAMESPACE}" addons-test-staging-secret addons-test-cfn-stack-staging-secret addons-test-staging-cdo-fan-in-secret | sed -n '1,260p' || true
    echo "FAIL ❌: synced Kubernetes Secret did not appear: ${secret_name}"
    exit 1
  fi
done

if ! wait_for_secret "${ADHOC_NAMESPACE}" "${ADHOC_SECRET}"; then
  kubectl get clusterexternalsecret addons-test-adhoc-secret -o yaml || true
  kubectl get externalsecret -n "${ADHOC_NAMESPACE}" || true
  echo "FAIL ❌: adhoc ClusterExternalSecret did not sync: ${ADHOC_SECRET}"
  exit 1
fi

echo "Starting pod to verify secrets are accessible..."
kubectl apply -f test-external-secrets-pod.yaml >/dev/null

echo "Waiting for verification pod to complete..."
for _ in {1..60}; do
  phase="$(kubectl get pod "${POD_NAME}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}' 2>/dev/null || true)"
  if [[ "${phase}" == "Succeeded" ]]; then
    echo "PASS ✅: direct, fan-in, and adhoc ExternalSecret syncs all succeeded."
    exit 0
  fi
  if [[ "${phase}" == "Failed" ]]; then
    kubectl logs "${POD_NAME}" -n "${NAMESPACE}" || true
    kubectl describe pod "${POD_NAME}" -n "${NAMESPACE}" | sed -n '1,200p'
    echo "FAIL ❌: verification pod could not read valid secret values."
    exit 1
  fi
  sleep 2
done

kubectl logs "${POD_NAME}" -n "${NAMESPACE}" || true
kubectl describe pod "${POD_NAME}" -n "${NAMESPACE}" | sed -n '1,200p'
echo "FAIL ❌: verification pod timed out."
exit 1
