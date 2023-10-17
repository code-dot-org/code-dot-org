require "test_helper"

class LtiDeploymentTest < ActiveSupport::TestCase
  test "validate required fields" do
    refute build(:lti_user_identity, lti_integration: nil).valid? "lti_integration is required"
  end
end
