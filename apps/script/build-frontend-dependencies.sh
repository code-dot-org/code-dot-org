#!/bin/bash

# This script builds dependencies for the `apps` (CodeAI Studio) directory which reside in the `frontend` directory.
# At present, the following dependencies are consumed:
# 1. **@code-dot-org/component-library**: Component Library
# 2. **@code-dot-org/fonts**: Fonts
# 3. **@code-dot-org/core**: Core utilities and components
# 4. **@code-dot-org/ailab**: AI Lab (Engine)
# 5. **@code-dot-org/teacher-dashboard**: Teacher Dashboard homepage components

set -x

cd ../frontend && \
  yarn && \
  yarn run build --filter @code-dot-org/component-library --filter @code-dot-org/fonts --filter @code-dot-org/core --filter @code-dot-org/ailab --filter @code-dot-org/teacher-dashboard --output-logs errors-only