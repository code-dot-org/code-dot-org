#!/bin/bash

curl -o build/package/css/application.css http://localhost-studio.code.org:3000/assets/application.css || curl -o build/package/css/application.css https://code-dot-org.github.io/cdo-styleguide/css/application.css
STORYBOOK_STATIC_ASSETS=1 storybook dev -p 9001
