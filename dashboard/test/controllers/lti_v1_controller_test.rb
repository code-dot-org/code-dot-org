require "test_helper"

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  setup_all do
    @integration = create :lti_integration
  end

  test 'given no params, return unauthorized' do
    get '/lti/v1/login', params: {}
    assert_response :unauthorized
  end

  test 'given a client_id that doesn not exist, return unauthorized' do
    get '/lti/v1/login', params: {client_id: '', iss: @integration.issuer}
    assert_response :unauthorized
  end

  test 'given a platform_id that does not exist, return unauthorized' do
    get '/lti/v1/login/wrong-id', params: {}
    assert_response :unauthorized
  end

  test 'given a valid client_id via GET, return redirect' do
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'given a valid client_id via POST, return redirect' do
    post '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'given a valid platform_id, return redirect' do
    get "/lti/v1/login/#{@integration.platform_id}", params: {}
    assert_response :redirect
  end

  test 'given valid parameters, set cookies' do
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_not_nil cookies[:state]
    assert_not_nil cookies[:nonce]
    assert_equal cookies[:state].length, 10
    assert_equal cookies[:nonce].length, 10
  end

  test 'given valid parameters, redirect URL should have valid auth request params' do
    login_hint = 'hint'
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer, login_hint: login_hint}
    parsed_url = Rack::Utils.parse_query(URI(@response.redirect_url).query).symbolize_keys
    assert_equal parsed_url[:scope], 'openid'
    assert_equal parsed_url[:response_type], 'id_token'
    assert_equal parsed_url[:client_id], @integration.client_id
    assert_equal parsed_url[:response_mode], 'form_post'
    assert_equal parsed_url[:prompt], 'none'
    assert_equal parsed_url[:login_hint], login_hint
    assert_not_nil parsed_url[:state]
    assert_not_nil parsed_url[:nonce]
  end

  test 'given no params, return unauthorized' do
  end
end
