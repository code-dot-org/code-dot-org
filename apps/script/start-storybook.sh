#!/bin/bash

curl -o build/package/css/application.css http://localhost-studio.code.org:3000/assets/application.css || curl -o build/package/css/application.css https://code-dot-org.github.io/cdo-styleguide/css/application.css
curl -o build/package/css/font-awesome.css http://localhost-studio.code.org:3000/assets/font-awesome.css
STORYBOOK_STATIC_ASSETS=1 start-storybook -p 9001
