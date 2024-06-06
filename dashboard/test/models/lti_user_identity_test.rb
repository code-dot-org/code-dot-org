require "test_helper"

class LtiUserIdentityTest < ActiveSupport::TestCase
  test "should validate required fields" do
    refute build(:lti_user_identity, subject: nil).valid? "subject is required"
    refute build(:lti_user_identity, user: nil).valid? "user is required"
    refute build(:lti_user_identity, lti_integration: nil).valid? "lti_integration is required"
  end
end
