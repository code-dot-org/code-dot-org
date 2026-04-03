#!/usr/bin/env bash
set -euo pipefail

script_dir="$(
  cd "$(dirname "$0")"
  pwd
)"

chart_yaml="$script_dir/Chart.yaml"
target="$script_dir/crds/standard-install.yaml"

gateway_api_version="$(
  awk '
    $1 == "appVersion:" {
      print $2
      exit
    }
  ' "$chart_yaml" | tr -d "\"'"
)"

if [[ -z "$gateway_api_version" ]]; then
  echo "missing appVersion in $chart_yaml" >&2
  exit 1
fi

url="https://github.com/kubernetes-sigs/gateway-api/releases/download/${gateway_api_version}/standard-install.yaml"
tmp="$(mktemp "${TMPDIR:-/tmp}/gateway-api-crds.XXXXXX")"

cleanup() {
  rm -f "$tmp"
}

trap cleanup EXIT

curl -L --fail --silent --show-error "$url" -o "$tmp"
mv "$tmp" "$target"
trap - EXIT

echo "wrote $target from $url"
