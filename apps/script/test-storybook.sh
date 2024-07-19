#!/bin/bash
set -e # Exit on error

DIR_TO_DEPLOY=build/storybook-deploy

echo "Building storybook..."

bash ./script/build-storybook.sh

echo "Installing Playwright"

npx playwright install --with-deps

echo "Starting storybook..."

# Starts storybook and waits for storybook to load before starting the storybook test runner
npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "http-server $DIR_TO_DEPLOY --port 9001 --silent" "wait-on http://127.0.0.1:9001 && yarn test:storybook"

echo "Storybook tests completed"