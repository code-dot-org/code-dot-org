
source docker/ci/scripts/prepare_ci_tests.sh

bundle exec rake install
bundle exec rake build
bundle exec rake ci:seed_ui_test

