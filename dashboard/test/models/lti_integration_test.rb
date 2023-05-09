require 'test_helper'

class LtiIntegrationTest < ActiveSupport::TestCase
  test "should not save an LtiIntegration without platform_id" do
    integration = build :lti_integration, platform_id: nil
    assert_not integration.save, "Saved the LtiIntegration without platform_id"
  end

  test "should not save an LtiIntegration without issuer" do
    integration = build :lti_integration, issuer: nil
    assert_not integration.save, "Saved the LtiIntegration without issuer"
  end

  test "should not save an LtiIntegration without client_id" do
    integration = build :lti_integration, client_id: nil
    assert_not integration.save, "Saved the LtiIntegration without client_id"
  end

  test "should not save an LtiIntegration without platform_name" do
    integration = build :lti_integration, platform_name: nil
    assert_not integration.save, "Saved the LtiIntegration without platform_name"
  end

  test "should not save an LtiIntegration without auth_redirect_url" do
    integration = build :lti_integration, auth_redirect_url: nil
    assert_not integration.save, "Saved the LtiIntegration without auth_redirect_url"
  end

  test "should not save an LtiIntegration without jwks_url" do
    integration = build :lti_integration, jwks_url: nil
    assert_not integration.save, "Saved the LtiIntegration without jwks_url"
  end

  test "should not save an LtiIntegration without access_token_url" do
    integration = build :lti_integration, access_token_url: nil
    assert_not integration.save, "Saved the LtiIntegration without access_token_url"
  end

  test "should save an LtiIntegration with required values" do
    integration = build :lti_integration
    assert integration.save, "Saved the LtiIntegration with required values"
  end

  test "should save an LtiIntegration with required values and name and admin_email" do
    integration_admin_email = "foo@bar.com"
    integration_name = "My Integration"
    integration = build :lti_integration, admin_email: integration_admin_email, name: integration_name
    assert integration.save, "Saved the LtiIntegration with required values"
    assert_equal(integration.name, integration_name)
    assert_equal(integration.admin_email, integration_admin_email)
  end
end
