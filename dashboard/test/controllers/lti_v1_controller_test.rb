require "test_helper"

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  setup_all do
    @integration = create :lti_integration
  end

  test "given no params, return unauthorized" do
    get "/lti/v1/login", params: {}
    assert_response :unauthorized
  end

  test "given a client_id that doesn't exist, return unauthorized" do
    get "/lti/v1/login", params: {client_id: "nope", iss: @integration.issuer}
    assert_response :unauthorized
  end

  test "given a platform_id that doesn't exist, return unauthorized" do
    get "/lti/v1/login/wrong-id", params: {}
    assert_response :unauthorized
  end

  test "given a valid client_id, return redirect" do
    get "/lti/v1/login", params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test "given a valid platform_id, return redirect" do
    get "/lti/v1/login/#{@integration.platform_id}", params: {}
    assert_response :redirect
  end

  test "given valid parameters, set cookies" do
    get "/lti/v1/login", params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_not_nil cookies[:state]
    assert_not_nil cookies[:nonce]
    assert_equal cookies[:state].length, 10
    assert_equal cookies[:nonce].length, 10
  end

  test "given a valid client_id via POST, return redirect" do
    post "/lti/v1/login", params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end
end
