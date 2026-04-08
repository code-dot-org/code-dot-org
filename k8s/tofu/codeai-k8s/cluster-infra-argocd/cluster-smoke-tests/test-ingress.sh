#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../test && pwd)"
cd "$TEST_DIR"

HOSTNAME_PREFIX="ingress-test"

random_alpha_suffix() {
  local chars="abcdefghijklmnopqrstuvwxyz"
  printf '%s%s' \
    "${chars:$((RANDOM % ${#chars})):1}" \
    "${chars:$((RANDOM % ${#chars})):1}"
}

format_elapsed() {
  local elapsed_seconds="$1"
  if (( elapsed_seconds >= 60 )); then printf '%s minutes and %02s seconds' "$((elapsed_seconds / 60))" "$((elapsed_seconds % 60))"; else printf '%s seconds' "${elapsed_seconds}"; fi
}

TEST_SUFFIX="$(random_alpha_suffix)"
NAMESPACE="${HOSTNAME_PREFIX}-${TEST_SUFFIX}"

cluster_dns_suffix() {
  local suffix
  suffix="$(
    kubectl -n external-dns get deploy external-dns \
      -o go-template='{{range .spec.template.spec.containers}}{{range .args}}{{println .}}{{end}}{{end}}' 2>/dev/null |
      sed -n 's/^--domain-filter=//p' |
      head -n1
  )"

  if [[ -z "${suffix}" ]]; then
    echo "FAIL ❌: could not determine cluster DNS suffix from external-dns deployment." >&2
    exit 1
  fi

  printf '%s\n' "${suffix}"
}

DNS_SUFFIX="$(cluster_dns_suffix)"
TEST_HOSTNAME="${HOSTNAME_PREFIX}-${TEST_SUFFIX}.${DNS_SUFFIX}"

wait_until_gone() {
  local resource="$1"
  local namespace="${2:-}"

  for _ in {1..60}; do
    if [[ -n "${namespace}" ]]; then
      if ! kubectl get "${resource}" -n "${namespace}" >/dev/null 2>&1; then
        return 0
      fi
    else
      if ! kubectl get "${resource}" >/dev/null 2>&1; then
        return 0
      fi
    fi
    sleep 2
  done

  return 1
}

force_finalize_namespace() {
  local namespace="$1"

  kubectl get namespace "${namespace}" -o json 2>/dev/null |
    jq '.spec.finalizers = []' |
    kubectl replace --raw "/api/v1/namespaces/${namespace}/finalize" -f - >/dev/null 2>&1 || true
}

cleanup() {
  local strict="${1:-false}"
  local namespace_deletion_timestamp=""

  kubectl delete ingress/hello service/hello deployment/hello -n "${NAMESPACE}" --ignore-not-found --wait=false >/dev/null 2>&1 || true
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found --wait=false >/dev/null 2>&1 || true

  local failed=false
  wait_until_gone ingress/hello "${NAMESPACE}" || failed=true
  wait_until_gone service/hello "${NAMESPACE}" || failed=true
  wait_until_gone deployment/hello "${NAMESPACE}" || failed=true

  namespace_deletion_timestamp="$(
    kubectl get namespace "${NAMESPACE}" -o jsonpath='{.metadata.deletionTimestamp}' 2>/dev/null || true
  )"
  if [[ -n "${namespace_deletion_timestamp}" ]]; then
    force_finalize_namespace "${NAMESPACE}"
  fi
  if ! wait_until_gone namespace/"${NAMESPACE}"; then
    if [[ -z "${namespace_deletion_timestamp}" ]]; then
      force_finalize_namespace "${NAMESPACE}"
    fi
    wait_until_gone namespace/"${NAMESPACE}" || failed=true
  fi

  if [[ "${strict}" == "true" && "${failed}" == "true" ]]; then
    echo "FAIL ❌: previous ingress test resources did not finish deleting." >&2
    return 1
  fi
}
trap cleanup EXIT

echo "Applying test-ingress resources..."
cleanup true
service_deployment_started_at="$(date +%s)"
echo "Ingress namespace: ${NAMESPACE}"
echo "Ingress hostname: ${TEST_HOSTNAME}"
kubectl create namespace "${NAMESPACE}" >/dev/null
sed \
  -e "s|__TEST_HOSTNAME__|${TEST_HOSTNAME}|g" \
  test-ingress.yaml | kubectl apply -n "${NAMESPACE}" -f - >/dev/null
kubectl wait --for=condition=available deployment/hello -n "${NAMESPACE}" --timeout=180s >/dev/null

echo "Waiting for ALB hostname..."
host=""
for _ in {1..60}; do
  host="$(kubectl get ingress hello -n "${NAMESPACE}" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)"
  if [[ -n "${host}" ]]; then
    break
  fi
  sleep 3
done

if [[ -z "${host}" ]]; then
  kubectl describe ingress hello -n "${NAMESPACE}" | sed -n '1,120p'
  echo "FAIL ❌: ingress hostname not assigned."
  exit 1
fi

echo "Ingress host: ${host}"

echo "Phase 1: testing ingress public reachability over HTTPS..."
rm -f /tmp/hello-ingress-response.txt
phase_1_passed=false
for _ in {1..60}; do
  ingress_ip="$(dig +short "${host}" A @1.1.1.1 | head -n1 || true)"
  ingress_ip="${ingress_ip:-${host}}"
  if [[ -n "${ingress_ip}" ]]; then
    if curl -fsS --max-time 5 --resolve "${TEST_HOSTNAME}:443:${ingress_ip}" "https://${TEST_HOSTNAME}/" >/tmp/hello-ingress-response.txt 2>/dev/null; then
      echo "Resolved assigned address ${host} via 1.1.1.1 to ${ingress_ip}"
      echo "Response sample:"
      sed -n '1,3p' /tmp/hello-ingress-response.txt
      echo "PASS ✅ phase 1: ingress is publicly reachable by its assigned address over HTTPS."
      phase_1_passed=true
      break
    fi
  fi
  sleep 3
done

if [[ "${phase_1_passed}" != "true" ]]; then
  kubectl get ingress hello -n "${NAMESPACE}" -o wide
  echo "FAIL ❌: ingress hostname exists but HTTPS was not reachable."
  exit 1
fi

echo "Phase 2: testing ExternalDNS hostname..."
for _ in {1..60}; do
  resolved_ip="$(dig +short "${TEST_HOSTNAME}" A @1.1.1.1 | head -n1 || true)"
  if [[ -n "${resolved_ip}" ]]; then
    if curl -fsS --max-time 5 --resolve "${TEST_HOSTNAME}:443:${resolved_ip}" "https://${TEST_HOSTNAME}/" >/tmp/hello-ingress-response.txt 2>/dev/null; then
      echo "Resolved ${TEST_HOSTNAME} via 1.1.1.1 to ${resolved_ip}"
      echo "Response sample:"
      sed -n '1,3p' /tmp/hello-ingress-response.txt
      elapsed_seconds="$(( $(date +%s) - service_deployment_started_at ))"
      printf '\nTime from service deployment to externally reachable by HTTPS:\n\033[1m%s\033[0m\n\n' "$(format_elapsed "${elapsed_seconds}")"
      echo "PASS ✅ phase 2: external DNS hostname (${TEST_HOSTNAME}) was reachable by HTTPS."
      exit 0
    fi
  fi
  sleep 5
done

kubectl get ingress hello -n "${NAMESPACE}" -o wide
echo "FAIL ❌: ingress worked, but the public hostname was not reachable over HTTPS."
exit 1
