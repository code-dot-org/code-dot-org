#!/usr/bin/env bash
set -euo pipefail

cluster_certificate_authority_data="$1"
cluster_endpoint="$2"
cluster_name="$3"
cluster_region="$4"
namespace="$5"
deployment_name="$6"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$*"
}

kubeconfig_file="$(mktemp)"
trap 'rm -f "$kubeconfig_file"' EXIT

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
	    namespace: $namespace
	    user: user
	current-context: context
	users:
	- name: user
	  user:
	    token: $token
EOF

log "Restarting deployment '$deployment_name' in namespace '$namespace'"
kubectl --kubeconfig "$kubeconfig_file" -n "$namespace" rollout restart "deployment/$deployment_name"

log "Waiting for deployment '$deployment_name' rollout to complete"
kubectl --kubeconfig "$kubeconfig_file" -n "$namespace" rollout status "deployment/$deployment_name" --timeout=10m

log "Deployment '$deployment_name' rollout completed"
