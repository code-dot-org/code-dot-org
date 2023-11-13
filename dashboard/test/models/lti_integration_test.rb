require 'test_helper'

class LtiIntegrationTest < ActiveSupport::TestCase
  test "platform_id should exist" do
    integration = create(:lti_integration)
    refute_nil integration.platform_id
    assert_equal integration.platform_id.length, 36
  end

  test "should validate required fields" do
    refute build(:lti_integration, issuer: nil).valid? "issuer is required"
    refute build(:lti_integration, client_id: nil).valid? "client_id is required"
    refute build(:lti_integration, platform_name: nil).valid? "platform_name is required"
    refute build(:lti_integration, auth_redirect_url: nil).valid? "auth_redirect_url is required"
    refute build(:lti_integration, jwks_url: nil).valid? "jwks_url is required"
    refute build(:lti_integration, access_token_url: nil).valid? "access_token_url is required"
  end
end
