#!/bin/bash
# This file executes storybook tests against a built version of storybook.
# See: https://storybook.js.org/docs/writing-tests/test-runner#run-against-non-deployed-storybooks

set -x

# Build a production version of Storybook
yarn build-storybook --quiet

# Wait for Storybook to be available and then execute the tests
npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
            "npx http-server storybook-static --port 6006 --silent" \
            "npx wait-on tcp:127.0.0.1:6006 && yarn test:ui:local"