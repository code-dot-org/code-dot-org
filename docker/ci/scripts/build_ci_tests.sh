# catch any code loader errors before starting any rails environment
bundle exec rake lint:zeitwerk
bundle exec rake build

bundle exec rake ci:seed_ui_test
