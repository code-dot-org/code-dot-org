require "test_helper"

class LtiUserIdentityTest < ActiveSupport::TestCase
  test "should validate required fields" do
    refute build(:lti_user_identity, subject: nil).valid? "subject is required"
    refute build(:lti_user_identity, user: nil).valid? "user is required"
    refute build(:lti_user_identity, lti_integration: nil).valid? "lti_integration is required"
  end
  test "should not allow duplicate subject/lti_integration_id" do
    lti_user_identity = create(:lti_user_identity)
    invalid_identity = build(:lti_user_identity, lti_integration_id: lti_user_identity.lti_integration.id, subject: lti_user_identity.subject)
    refute invalid_identity.valid?
    assert_includes invalid_identity.errors.full_messages, 'Subject has already been taken'
  end
end
