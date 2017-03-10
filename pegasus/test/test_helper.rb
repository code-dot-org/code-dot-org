# Test setup for unit tests in pegasus folder
require_relative '../../shared/test/common_test_helper'

# allow us to load pages such as /learn, which reference javascript assets,
# without having to precompile dashboard assets first
CDO.pegasus_skip_asset_map = true

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/pegasus")
end
Minitest::Reporters.use! reporters
