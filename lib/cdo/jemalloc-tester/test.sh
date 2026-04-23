#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE="temp-jemalloc-check"

cd "${CDO_DIR}"

echo "[1/3] Building image..."
docker build . -t "${IMAGE}" -f jemalloc-tester/Dockerfile

echo "[2/3] Running without jemalloc..."
without_output="$(docker run --rm -e USE_JEMALLOC=0 "${IMAGE}")"
echo "${without_output}"
echo "${without_output}" | rg -q 'preloaded\?=false'

echo "[3/3] Running with jemalloc..."
with_output="$(docker run --rm -e USE_JEMALLOC=1 "${IMAGE}")"
echo "${with_output}"
echo "${with_output}" | rg -q 'preloaded\?=true'

echo "PASS"
