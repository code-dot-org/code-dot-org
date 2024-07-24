# Test setup for unit tests in pegasus folder
require_relative '../../shared/test/common_test_helper'
require_relative '../../shared/test/capture_queries'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV.fetch('CIRCLE_TEST_REPORTS', nil)}/pegasus")
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

class Minitest::Test
  def before_setup
    # Ensure that AssetHelper#webpack_asset_path does not raise an exception
    # when called from unit tests. See comments on that method for details.
    CDO.stubs(optimize_webpack_assets: false)
    CDO.stubs(use_my_apps: true)
  end
end
