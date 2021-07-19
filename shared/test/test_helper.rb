# Test settings for shared directory

require_relative './common_test_helper'

require 'webmock'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/shared")
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

WebMock.disable_net_connect!

# Decide whether we may use real Redis in tests.
# Disallow in environments other than dev/test to safeguard production data.
def use_real_redis?
  ENV['USE_REAL_REDIS'] && [:develpoment, :test].include?(rack_env)
end
