#!/bin/bash

[[ $CIRCLE_NODE_INDEX == 0 ]] && bundle exec rake lint:javascript
timeout 7200 /bin/bash -c 'case $CIRCLE_NODE_INDEX in 0) bundle exec rake circle:run_tests ;; *) bundle exec rake circle:run_ui_tests ;; esac:'
[[ $CIRCLE_NODE_INDEX == 0 ]] && (cd cookbooks && ./test.sh)
