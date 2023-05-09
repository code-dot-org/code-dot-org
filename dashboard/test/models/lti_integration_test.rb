require 'test_helper'

class LtiIntegrationTest < ActiveSupport::TestCase
  # Creates new integration and allows overrides for removing/adding key/values
  def create_integration_with_defaults(overrides)
    defaults = {
      platform_id: "1a2b3c5b",
      issuer: "http://some.lms.com",
      client_id: "12345678",
      platform_name: "canavs",
      auth_redirect_url: "http://some.lms.com/lti/authenticate",
      jwks_url: "http://some.lms.com/jwks",
      access_token_url: "http://some.lms.com/access_token",
    }

    LtiIntegration.new(defaults.merge(overrides))
  end

  test "should not save an LtiIntegration without platform_id" do
    integration = create_integration_with_defaults(platform_id: nil)
    assert_not integration.save, "Saved the LtiIntegration without platform_id"
  end

  test "should not save an LtiIntegration without issuer" do
    integration = create_integration_with_defaults(issuer: nil)
    assert_not integration.save, "Saved the LtiIntegration without issuer"
  end

  test "should not save an LtiIntegration without client_id" do
    integration = create_integration_with_defaults(client_id: nil)
    assert_not integration.save, "Saved the LtiIntegration without client_id"
  end

  test "should not save an LtiIntegration without platform_name" do
    integration = create_integration_with_defaults(platform_name: nil)
    assert_not integration.save, "Saved the LtiIntegration without platform_name"
  end

  test "should not save an LtiIntegration without auth_redirect_url" do
    integration = create_integration_with_defaults(auth_redirect_url: nil)
    assert_not integration.save, "Saved the LtiIntegration without auth_redirect_url"
  end

  test "should not save an LtiIntegration without jwks_url" do
    integration = create_integration_with_defaults(jwks_url: nil)
    assert_not integration.save, "Saved the LtiIntegration without jwks_url"
  end

  test "should not save an LtiIntegration without access_token_url" do
    integration = create_integration_with_defaults(access_token_url: nil)
    assert_not integration.save, "Saved the LtiIntegration without access_token_url"
  end

  test "should save an LtiIntegration with required values" do
    integration = create_integration_with_defaults({})
    assert integration.save, "Saved the LtiIntegration with required values"
  end

  test "should save an LtiIntegration with required values and name and admin_email" do
    integration_admin_email = "foo@bar.com"
    integration_name = "My Integration"
    integration = create_integration_with_defaults({name: integration_name, admin_email: integration_admin_email})
    assert integration.save, "Saved the LtiIntegration with required values"
    assert_equal(integration.name, integration_name)
    assert_equal(integration.admin_email, integration_admin_email)
  end
end
