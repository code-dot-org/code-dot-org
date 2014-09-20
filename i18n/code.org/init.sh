#!/bin/bash

set -e

if [[ -z $CROWDIN_API_KEY ]]; then
  echo 'Expected CROWDIN_API_KEY to be defined'
  exit 1
fi

cat > ./crowdin.yaml <<EOF
---
project_identifier: codeorg
api_key: $CROWDIN_API_KEY
base_path: locales

files:
  -
    source: '/en-US/**/*.yml'
    translation: '/%locale%/**/%original_file_name%'
  -
    source: '/en-US/**/*.json'
    translation: '/%locale%/**/%original_file_name%'
EOF
