require 'json'
require 'jwt'
require 'test_helper'

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  setup_all do
    @integration = create :lti_integration
    # create an arbitrary key for testing JWTs
    @key = SecureRandom.alphanumeric 10
    # create arbitary state and nonce values
    @state = 'state'
    @nonce = 'nonce'
  end

  setup do
    # stub cache reads for each test
    LtiV1Controller.any_instance.stubs(:read_cache).returns({state: @state, nonce: @nonce})
  end

  def create_jwt(payload)
    JWT.encode(payload, @key)
  end

  def create_jwt_and_stub(payload, raises_error = false)
    if raises_error
      LtiV1Controller.any_instance.stubs(:get_decoded_jwt).raises JWT::DecodeError
    else
      LtiV1Controller.any_instance.stubs(:get_decoded_jwt).returns payload
    end
    create_jwt(payload)
  end

  def get_valid_payload(aud_is_array = false)
    # an example redirect URI, any URI should work here.
    target_link_uri = CDO.studio_url('/', CDO.default_scheme)
    aud = if aud_is_array
            [@integration.client_id]
          else
            @integration.client_id
          end
    {
      aud: aud,
      azp: @integration.client_id,
      exp: 7.days.from_now.to_i,
      iat: 1.day.ago.to_i,
      iss: @integration.issuer,
      nonce: @nonce,
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': target_link_uri,
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest'
    }
  end

  def create_valid_jwt(aud_is_array)
    payload = get_valid_payload(aud_is_array)
    create_jwt_and_stub(payload)
  end

  def create_valid_jwt_raise_error
    payload = get_valid_payload(false)
    create_jwt_and_stub(payload, true)
  end

  test 'login - given no params, return unauthorized' do
    get '/lti/v1/login', params: {}
    assert_response :unauthorized
  end

  test 'login - given a client_id that doesn not exist, return unauthorized' do
    get '/lti/v1/login', params: {client_id: '', iss: @integration.issuer}
    assert_response :unauthorized
  end

  test 'login - given a platform_id that does not exist, return unauthorized' do
    get '/lti/v1/login/wrong-id', params: {}
    assert_response :unauthorized
  end

  test 'login - given a valid client_id via GET, return redirect' do
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'login - given a valid client_id via POST, return redirect' do
    post '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'login - given a valid platform_id, return redirect' do
    get "/lti/v1/login/#{@integration.platform_id}", params: {}
    assert_response :redirect
  end

  test 'login - given a valid client_id, write_cache should be called' do
    LtiV1Controller.any_instance.expects(:write_cache)
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
  end

  test 'login - given valid parameters, redirect URL should have valid auth request params' do
    login_hint = 'hint'
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer, login_hint: login_hint}
    parsed_url = Rack::Utils.parse_query(URI(@response.redirect_url).query).symbolize_keys
    assert_equal parsed_url[:scope], 'openid'
    assert_equal parsed_url[:response_type], 'id_token'
    assert_equal parsed_url[:client_id], @integration.client_id
    assert_equal parsed_url[:response_mode], 'form_post'
    assert_equal parsed_url[:prompt], 'none'
    assert_equal parsed_url[:login_hint], login_hint
    refute_nil parsed_url[:state]
    refute_nil parsed_url[:nonce]
  end

  test 'auth - given no params, return unauthorized' do
    post '/lti/v1/authenticate'
    assert_response :unauthorized
  end

  test 'auth - given no client_id (aud) in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:aud] = nil
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given no issuer id in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:iss] = nil
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given wrong client id in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:aud] = ''
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - audience does not match client_id with azp present - unauthorized' do
    payload = get_valid_payload
    payload[:azp] = ''
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - expiration time past return unauthorized' do
    payload = get_valid_payload
    payload[:exp] = 3.days.ago.to_i
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - error raised for issued at time in future' do
    payload = get_valid_payload
    payload[:iat] = 3.days.from_now.to_i
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - LTI Resource Type wrong' do
    payload = get_valid_payload
    payload[:'https://purl.imsglobal.org/spec/lti/claim/message_type'] = 'file'
    LtiV1Controller.any_instance.stubs(:get_decoded_jwt).returns payload
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :not_acceptable
  end

  test 'auth - error raised in decoding jwt' do
    jwt = create_valid_jwt_raise_error
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given a valid jwt with the audience as an array, redirect to target_link_url' do
    aud_is_array = true
    jwt = create_valid_jwt(aud_is_array)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :redirect
  end

  test 'auth - given a valid jwt, redirect to target_link_url' do
    aud_is_array = false
    jwt = create_valid_jwt(aud_is_array)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :redirect
    # could confirm more things here
  end
end
