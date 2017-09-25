# Test settings for shared directory

require_relative './common_test_helper'

require 'webmock'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/shared")
end
Minitest::Reporters.use! reporters

WebMock.disable_net_connect!

# Decide whether we may use real Redis in tests.
# Disallow in environments other than dev/test to safeguard production data.
def use_real_redis?
  ENV['USE_REAL_REDIS'] && [:develpoment, :test].include?(rack_env)
end
