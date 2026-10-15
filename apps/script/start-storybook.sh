#!/bin/bash

curl -o build/package/css/legacy-styles.css http://localhost-studio.code.org:3000/assets/legacy-styles.css || curl -o build/package/css/legacy-styles.css https://code-dot-org.github.io/cdo-styleguide/css/legacy-styles.css
STORYBOOK_STATIC_ASSETS=1 storybook dev -p 9001
