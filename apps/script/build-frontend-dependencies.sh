#!/bin/bash

# This script builds dependencies for the `apps` (Code.org Studio) directory which reside in the `frontend` directory.
# At present, the following dependencies are consumed:
# 1. **@code-dot-org/component-library**: Component Library

set -x

cd ../frontend && \
  yarn && \
  # Component Library
  yarn run build --filter @code-dot-org/component-library --output-logs errors-only