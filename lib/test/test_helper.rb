require_relative '../../shared/test/common_test_helper'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/lib")
end
Minitest::Reporters.use! reporters
