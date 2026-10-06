#!/bin/bash

# This script builds dependencies for the `apps` (CodeAI Studio) directory which reside in the `frontend` directory.
# At present, the following dependencies are consumed:
# 1. **@code-dot-org/component-library**: Component Library
# 2. **@code-dot-org/fonts**: Fonts
# 3. **@code-dot-org/core**: Core utilities and components
# 4. **@code-dot-org/ailab**: AI Lab (Engine)
# 5. **@code-dot-org/lesson-deep-dive**: AI Tutor+ post-lesson review views

set -x

APPS_DEPENDENCIES=(
  --filter @code-dot-org/component-library
  --filter @code-dot-org/fonts
  --filter @code-dot-org/core
  --filter @code-dot-org/ailab
  --filter @code-dot-org/lesson-deep-dive
  --filter @code-dot-org/markdown
)

cd ../frontend || exit 1

# No turbo cache in either mode below. A git checkout during a build gets
# cached under the old tree's key and is served as stale dist later; see
# INF-2257. Costs ~40 s per start. Env var because `turbo watch` has no flag.
export TURBO_CACHE='local:,remote:'

if [ "$1" = "--watch" ]; then
  # watch mode skips `yarn` install: the plain invocation below always runs
  # first, as part of grunt's prebuild task.
  exec yarn turbo watch build "${APPS_DEPENDENCIES[@]}" --output-logs errors-only
else
  # Empty dist once here, before webpack starts watching it. Package builds no
  # longer empty it themselves (emptyOutDir: false) because webpack never
  # recovers on macOS when watched files vanish mid-build (INF-2257). This
  # clean is what keeps removed or renamed outputs from piling up over time.
  yarn && \
  yarn run clean "${APPS_DEPENDENCIES[@]}" --output-logs errors-only && \
  yarn run build "${APPS_DEPENDENCIES[@]}" --output-logs errors-only
fi
