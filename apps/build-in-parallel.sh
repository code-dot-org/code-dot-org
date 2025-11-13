#!/bin/bash
# This script configures and runs the production build with configurable
# parallelism and memory settings for optimal CI performance.
#
# Environment variables:
#   APPS_BUILD_WORKERS - Number of workers for thread-loader and TerserPlugin (default: 4)
#   APPS_BUILD_MAX_MEMORY - Max memory in MB for Node.js heap (default: 8192)

set -e

# Default values optimized for local development
DEFAULT_WORKERS=4
DEFAULT_MAX_MEMORY=8192

# Read environment variables or use defaults
APPS_BUILD_WORKERS=${APPS_BUILD_WORKERS:-$DEFAULT_WORKERS}
APPS_BUILD_MAX_MEMORY=${APPS_BUILD_MAX_MEMORY:-$DEFAULT_MAX_MEMORY}

# Export for webpack.config.js to read
export APPS_BUILD_WORKERS

echo "Building with configuration:"
echo "  Workers: ${APPS_BUILD_WORKERS}"
echo "  Max Memory: ${APPS_BUILD_MAX_MEMORY}MB"
echo

# Set Node.js memory and run the build
NODE_OPTIONS="--max-old-space-size=${APPS_BUILD_MAX_MEMORY}" npx grunt clean build
