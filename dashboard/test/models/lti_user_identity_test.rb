require "test_helper"

class LtiUserIdentityTest < ActiveSupport::TestCase
  test "should validate required fields" do
    assert_not build(:lti_user_identity, subject: nil).valid? "subject is required"
    assert_not build(:lti_user_identity, user: nil).valid? "user is required"
    assert_not build(:lti_user_identity, lti_integration: nil).valid? "lti_integration is required"
  end
end
