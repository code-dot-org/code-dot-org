#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../test && pwd)"
cd "$TEST_DIR"

GATEWAY_NAME="hello-gateway"
ROUTE_NAME="hello-gateway"
DEPLOYMENT_NAME="hello-gateway"
HOSTNAME_PREFIX="gateway-test"

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

  kubectl delete httproute/"${ROUTE_NAME}" gateway/"${GATEWAY_NAME}" \
    service/"${DEPLOYMENT_NAME}" deployment/"${DEPLOYMENT_NAME}" \
    -n "${NAMESPACE}" --ignore-not-found --wait=false >/dev/null 2>&1 || true
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found --wait=false >/dev/null 2>&1 || true

  local failed=false
  wait_until_gone httproute/"${ROUTE_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone gateway/"${GATEWAY_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone service/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone deployment/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
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
    echo "FAIL ❌: previous gateway test resources did not finish deleting." >&2
    return 1
  fi
}
trap cleanup EXIT

if ! kubectl get gatewayclass aws-alb >/dev/null 2>&1; then
  echo "FAIL ❌: gatewayclass aws-alb not found. Apply the cluster-infra-argocd Tofu changes first." >&2
  exit 1
fi

echo "Applying test-gateway-http resources..."
cleanup true
service_deployment_started_at="$(date +%s)"
echo "Gateway namespace: ${NAMESPACE}"
echo "Gateway hostname: ${TEST_HOSTNAME}"
kubectl create namespace "${NAMESPACE}" >/dev/null
sed \
  -e "s|__TEST_HOSTNAME__|${TEST_HOSTNAME}|g" \
  test-gateway-http.yaml | kubectl apply -n "${NAMESPACE}" -f - >/dev/null
kubectl wait --for=condition=available deployment/"${DEPLOYMENT_NAME}" -n "${NAMESPACE}" --timeout=180s >/dev/null

echo "Waiting for Gateway address..."
gateway_address=""
for _ in {1..60}; do
  gateway_address="$(kubectl get gateway "${GATEWAY_NAME}" -n "${NAMESPACE}" -o jsonpath='{.status.addresses[0].value}' 2>/dev/null || true)"
  if [[ -n "${gateway_address}" ]]; then
    break
  fi
  sleep 3
done

if [[ -z "${gateway_address}" ]]; then
  kubectl describe gateway "${GATEWAY_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  kubectl describe httproute "${ROUTE_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  echo "FAIL ❌: Gateway address was not assigned."
  exit 1
fi

route_host="$(kubectl get httproute "${ROUTE_NAME}" -n "${NAMESPACE}" -o jsonpath='{.spec.hostnames[0]}' 2>/dev/null || true)"
if [[ -z "${route_host}" ]]; then
  echo "FAIL ❌: HTTPRoute hostname was not set."
  exit 1
fi

echo "Gateway address: ${gateway_address}"
echo "HTTPRoute hostname: ${route_host}"

echo "Phase 1: testing Gateway public reachability over HTTPS..."
rm -f /tmp/hello-gateway-phase1-response.txt /tmp/hello-gateway-phase2-response.txt
phase_1_passed=false
for _ in {1..60}; do
  gateway_ip="$(dig +short "${gateway_address}" A @1.1.1.1 | head -n1 || true)"
  gateway_ip="${gateway_ip:-${gateway_address}}"
  if [[ -n "${gateway_ip}" ]]; then
    if curl -fsS --max-time 5 --resolve "${route_host}:443:${gateway_ip}" "https://${route_host}/" >/tmp/hello-gateway-phase1-response.txt 2>/dev/null; then
      echo "Resolved assigned address ${gateway_address} via 1.1.1.1 to ${gateway_ip}"
      echo "Response sample:"
      sed -n '1,3p' /tmp/hello-gateway-phase1-response.txt
      echo "PASS ✅ phase 1: gateway is publicly reachable by its assigned address over HTTPS."
      phase_1_passed=true
      break
    fi
  fi
  sleep 3
done

if [[ "${phase_1_passed}" != "true" ]]; then
  kubectl describe gateway "${GATEWAY_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  kubectl describe httproute "${ROUTE_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  echo "FAIL ❌: gateway address exists but the routed HTTPS endpoint was not reachable."
  exit 1
fi

echo "Phase 2: testing ExternalDNS hostname..."
phase_2_passed=false
for _ in {1..60}; do
  # Some local recursive resolvers negatively cache fresh records for a while.
  # Use a public resolver to verify that ExternalDNS published the hostname,
  # then connect to that resolved IP while keeping the public hostname in the URL.
  resolved_ip="$(dig +short "${route_host}" A @1.1.1.1 | head -n1 || true)"
  if [[ -n "${resolved_ip}" ]]; then
    if curl -fsS --max-time 5 --resolve "${route_host}:443:${resolved_ip}" "https://${route_host}/" >/tmp/hello-gateway-phase2-response.txt 2>/dev/null; then
      echo "Resolved ${route_host} via 1.1.1.1 to ${resolved_ip}"
      echo "Response sample:"
      sed -n '1,3p' /tmp/hello-gateway-phase2-response.txt
      elapsed_seconds="$(( $(date +%s) - service_deployment_started_at ))"
      printf '\nTime from service deployment to externally reachable by HTTPS:\n\033[1m%s\033[0m\n\n' "$(format_elapsed "${elapsed_seconds}")"
      echo "PASS ✅ phase 2: external DNS hostname (${route_host}) was reachable by HTTPS."
      phase_2_passed=true
      break
    fi
  fi
  sleep 5
done

if [[ "${phase_2_passed}" == "true" ]]; then
  exit 0
fi

kubectl describe gateway "${GATEWAY_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
kubectl describe httproute "${ROUTE_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
echo "Gateway address at failure time: ${gateway_address}"
echo "HTTPRoute hostname at failure time: ${route_host}"
echo "FAIL ❌: gateway worked, but the public hostname was not reachable over HTTPS."
exit 1
