#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

NAMESPACE="gateway-test"
GATEWAY_NAME="hello"
ROUTE_NAME="hello"
DEPLOYMENT_NAME="hello"

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

cleanup() {
  local strict="${1:-false}"

  kubectl delete httproute/"${ROUTE_NAME}" gateway/"${GATEWAY_NAME}" \
    service/"${DEPLOYMENT_NAME}" deployment/"${DEPLOYMENT_NAME}" \
    loadbalancerconfiguration.gateway.k8s.aws/"${DEPLOYMENT_NAME}" \
    targetgroupconfiguration.gateway.k8s.aws/"${DEPLOYMENT_NAME}" \
    -n "${NAMESPACE}" --ignore-not-found --wait=false >/dev/null 2>&1 || true
  kubectl delete gatewayclass aws-alb --ignore-not-found --wait=false >/dev/null 2>&1 || true

  local failed=false
  wait_until_gone httproute/"${ROUTE_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone gateway/"${GATEWAY_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone service/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone deployment/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone loadbalancerconfiguration.gateway.k8s.aws/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone targetgroupconfiguration.gateway.k8s.aws/"${DEPLOYMENT_NAME}" "${NAMESPACE}" || failed=true
  wait_until_gone gatewayclass/aws-alb || failed=true

  if [[ "${strict}" == "true" && "${failed}" == "true" ]]; then
    echo "FAIL ❌: previous gateway test resources did not finish deleting." >&2
    return 1
  fi
}
trap cleanup EXIT

echo "Applying test-gateway-http resources..."
cleanup true
kubectl apply -f test-gateway-http.yaml >/dev/null
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

echo "Phase 1: testing Gateway public reachability..."
rm -f /tmp/hello-gateway-phase1-response.txt /tmp/hello-gateway-phase2-response.txt
phase_1_passed=false
for _ in {1..60}; do
  if curl -fsS --max-time 5 -H "Host: ${route_host}" "http://${gateway_address}/" >/tmp/hello-gateway-phase1-response.txt 2>/dev/null; then
    echo "Response sample:"
    sed -n '1,3p' /tmp/hello-gateway-phase1-response.txt
    echo "PASS ✅ phase 1: gateway is publicly reachable by its assigned address."
    phase_1_passed=true
    break
  fi
  sleep 3
done

if [[ "${phase_1_passed}" != "true" ]]; then
  kubectl describe gateway "${GATEWAY_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  kubectl describe httproute "${ROUTE_NAME}" -n "${NAMESPACE}" | sed -n '1,200p' || true
  echo "FAIL ❌: gateway address exists but the routed HTTP endpoint was not reachable."
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
    if curl -fsS --max-time 5 --resolve "${route_host}:80:${resolved_ip}" "http://${route_host}/" >/tmp/hello-gateway-phase2-response.txt 2>/dev/null; then
      echo "Resolved ${route_host} via 1.1.1.1 to ${resolved_ip}"
      echo "Response sample:"
      sed -n '1,3p' /tmp/hello-gateway-phase2-response.txt
      echo "PASS ✅ phase 2: external DNS hostname is resolving and reachable."
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
echo "FAIL ❌: gateway worked, but the public hostname was not reachable."
exit 1
