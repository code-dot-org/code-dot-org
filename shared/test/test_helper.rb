# Test settings for shared directory

require_relative './common_test_helper'

require 'webmock'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV.fetch('CIRCLE_TEST_REPORTS', nil)}/shared")
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

WebMock.disable_net_connect!
