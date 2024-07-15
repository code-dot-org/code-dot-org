# Test settings for middleware directory

require_relative '../../../../shared/test/common_test_helper'

require 'webmock'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV.fetch('CIRCLE_TEST_REPORTS', nil)}/middleware")
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

WebMock.disable_net_connect!

# Decide whether we may use real Redis in tests.
# Disallow in environments other than dev/test to safeguard production data.
def use_real_redis?
  ENV.fetch('USE_REAL_REDIS', nil) && [:develpoment, :test].include?(rack_env)
end
