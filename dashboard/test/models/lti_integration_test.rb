require 'test_helper'

class LtiIntegrationTest < ActiveSupport::TestCase
  test "should validate required fields" do
    assert_not build(:lti_integration, platform_id: nil).valid? "Missing platform_id should be invalid"
    assert_not build(:lti_integration, issuer: nil).valid? "Missing issuer should be invalid"
    assert_not build(:lti_integration, client_id: nil).valid? "Missing client_id should be invalid"
    assert_not build(:lti_integration, platform_name: nil).valid? "Missing platform_name should be invalid"
    assert_not build(:lti_integration, auth_redirect_url: nil).valid? "Missing auth_redirect_url should be invalid"
    assert_not build(:lti_integration, jwks_url: nil).valid? "Missing jwks_url should be invalid"
    assert_not build(:lti_integration, access_token_url: nil).valid? "Missing access_token_url should be invalid"
  end
end
