require 'json'
require 'jwt'
require "test_helper"

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  setup_all do
    @integration = create :lti_integration
    # create an arbitrary key for testing JWTs
    @key = SecureRandom.alphanumeric 10
  end

  def create_jwt(payload)
    JWT.encode(payload, @key)
  end

  def create_valid_jwt(aud_is_array)
    target_link_uri = @integration.auth_redirect_url
    aud = if aud_is_array
            [@integration.client_id]
          else
            @integration.client_id
          end
    payload = {
      aud: aud,
      iss: @integration.issuer,
      azp: @integration.client_id,
      exp: 7.days.from_now.to_i,
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': target_link_uri
    }
    LtiV1Controller.any_instance.stubs(:get_decoded_jwt).returns payload
    create_jwt(payload)
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

  test 'get auth - given no params, return unauthorized' do
    get '/lti/v1/authenticate'
    assert_response :unauthorized
  end

  test 'post auth - given no params, return unauthorized' do
    post '/lti/v1/authenticate'
    assert_response :unauthorized
  end

  test 'auth get - given no client_id (aud) in jwt return unauthorized' do
    payload = {data: 'test'}
    jwt = create_jwt(payload)
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth post - given no client_id (aud) in jwt return unauthorized' do
    payload = {data: 'test'}
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth get - given no issuer id in jwt return unauthorized' do
    jwt = create_jwt({aud: @integration.client_id})
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth post - given no issuer id in jwt return unauthorized' do
    jwt = create_jwt({aud: @integration.client_id})
    post '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth get - given wrong client id in jwt return unauthorized' do
    jwt = create_jwt({aud: ''})
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth post - given wrong client id in jwt return unauthorized' do
    jwt = create_jwt({aud: ''})
    post '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth get - given wrong client id and issuer in jwt return unauthorized' do
    jwt = create_jwt({aud: "", iss: ""})
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :unauthorized
  end

  test 'auth - given audience as non-String return unauthorized' do
  end

  test 'auth - audience does not contain azp return unauthorized' do
  end

  test 'auth - audience does not match client_id with azp present - unauthorized' do
  end

  test 'auth - expiration time past return unauthorized' do
  end

  test 'auth - given audience not a client id return unauthorized' do
    aud_is_array = true
    jwt = create_valid_jwt(aud_is_array)
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :redirect
  end

  test 'given a valid jwt, redirect to target_link_url' do
    aud_is_array = false
    jwt = create_valid_jwt(aud_is_array)
    get '/lti/v1/authenticate', params: {id_token: jwt}
    assert_response :redirect
    # could confirm more things here
  end
end
