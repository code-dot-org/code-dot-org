# Test setup for unit tests in pegasus folder
require_relative '../../shared/test/common_test_helper'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/pegasus")
end
Minitest::Reporters.use! reporters

class Minitest::Test
  def before_setup
    # Ensure that AssetHelper#webpack_asset_path does not raise an exception
    # when called from unit tests. See comments on that method for details.
    CDO.stubs(optimize_webpack_assets: false)
    CDO.stubs(use_my_apps: true)
  end
end
