#!/bin/bash

# This script builds dependencies for the `apps` (Code.org Studio) directory which reside in the `frontend` directory.
# At present, the following dependencies are consumed:
# 1. **@code-dot-org/component-library**: Component Library
# 2. **@code-dot-org/fonts**: Fonts
# 3. **@code-dot-org/core**: Core utilities and components

set -x

cd ../frontend && \
  yarn && \
  yarn run build --filter @code-dot-org/component-library --filter @code-dot-org/fonts --filter @code-dot-org/core --output-logs errors-only