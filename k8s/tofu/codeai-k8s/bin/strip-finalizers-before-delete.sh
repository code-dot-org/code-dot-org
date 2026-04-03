#!/usr/bin/env bash
set -euo pipefail

watch_pid="$1"
application_name="$2"
cluster_certificate_authority_data="$3"
cluster_endpoint="$4"
cluster_name="$5"
cluster_region="$6"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$*"
}

kubeconfig_file="$(mktemp)"
trap 'rm -f "$kubeconfig_file"' EXIT
trap 'log "Timed out"; exit 124' TERM

log "Fetching EKS token for cluster '$cluster_name' in region '$cluster_region'"
token="$(aws eks get-token --region="$cluster_region" --cluster-name="$cluster_name" --query='status.token' --output=text)"

cat >"$kubeconfig_file" <<-EOF
	apiVersion: v1
	kind: Config
	clusters:
	- name: cluster
	  cluster:
	    certificate-authority-data: $cluster_certificate_authority_data
	    server: $cluster_endpoint
	contexts:
	- name: context
	  context:
	    cluster: cluster
	    namespace: argocd
	    user: user
	current-context: context
	users:
	- name: user
	  user:
	    token: $token
EOF

attempt=1
while true; do
  kill -0 "$watch_pid" 2>/dev/null || {
    log "Parent pid '$watch_pid' is gone; exiting early"
    exit 1
  }

  log "Patching attempt #$attempt"
  kubectl --kubeconfig "$kubeconfig_file" get application "$application_name" 2>&1 \
    | tee /dev/stderr | grep -F 'NotFound' >/dev/null && {
      log "Application '$application_name' no longer exists"
      exit 0
    }

  kubectl --kubeconfig "$kubeconfig_file" \
    patch application "$application_name" \
    --type=merge \
    -p '{"metadata":{"finalizers":[]}}' || true

  sleep 15
  attempt=$((attempt + 1))
done
