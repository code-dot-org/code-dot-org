#!/bin/bash

# This script builds dependencies for the `apps` (CodeAI Studio) directory which reside in the `frontend` directory.
# At present, the following dependencies are consumed:
# 1. **@code-dot-org/component-library**: Component Library
# 2. **@code-dot-org/fonts**: Fonts
# 3. **@code-dot-org/core**: Core utilities and components
# 4. **@code-dot-org/ailab**: AI Lab (Engine)

set -x

FILTERS=(
  --filter @code-dot-org/component-library
  --filter @code-dot-org/fonts
  --filter @code-dot-org/core
  --filter @code-dot-org/ailab
)

cd ../frontend || exit 1

if [ "$1" = "--watch" ]; then
  # watch mode skips `yarn` install: the plain invocation below always runs
  # first, as part of grunt's prebuild task.
  exec yarn turbo watch build "${FILTERS[@]}" --output-logs errors-only
else
  yarn && \
    yarn run build "${FILTERS[@]}" --output-logs errors-only
fi