#!/usr/bin/env bash
set -euo pipefail

AWS_PROFILE_NAME="${AWS_PROFILE_NAME:-codeorg-admin}"
AWS_CONFIG_SOURCE="${AWS_CONFIG_SOURCE:-$HOME/.aws/config}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-60}"
NAMESPACE="${NAMESPACE:-argocd}"
LABEL_SELECTOR="${LABEL_SELECTOR:-app.kubernetes.io/name=argocd-repo-server}"

tmp_aws_config="$(mktemp)"
cleanup() {
  rm -f "$tmp_aws_config"
}
trap cleanup EXIT

awk -v profile="[profile $AWS_PROFILE_NAME]" '
  $0 == profile {in_profile = 1}
  in_profile && $0 ~ /^\[/ && $0 != profile {exit}
  in_profile {print}
' "$AWS_CONFIG_SOURCE" > "$tmp_aws_config"

if [[ ! -s "$tmp_aws_config" ]]; then
  echo "Profile [profile $AWS_PROFILE_NAME] not found in $AWS_CONFIG_SOURCE" >&2
  exit 1
fi

cat >> "$tmp_aws_config" <<EOF

[profile ${AWS_PROFILE_NAME}_session]
aws_access_key_id = dummy
aws_secret_access_key = dummy
aws_session_token = dummy
EOF

while true; do
  timestamp="$(date +'%a %b %e %Y %I:%M %p')"
  pod="$(
    AWS_CONFIG_FILE="$tmp_aws_config" AWS_PROFILE="$AWS_PROFILE_NAME" \
      kubectl get pods -n "$NAMESPACE" -l "$LABEL_SELECTOR" -o jsonpath='{.items[0].metadata.name}'
  )"

  read -r used use_percent < <(
    AWS_CONFIG_FILE="$tmp_aws_config" AWS_PROFILE="$AWS_PROFILE_NAME" \
      kubectl exec -n "$NAMESPACE" -c repo-server "$pod" -- sh -c \
      "df -h / | awk 'NR==2 {print \$3, \$5}'" 2>/dev/null
  )

  printf '%s: \033[1m%s / %s used\033[0m\n' "$timestamp" "$used" "$use_percent"
  sleep "$INTERVAL_SECONDS"
done
