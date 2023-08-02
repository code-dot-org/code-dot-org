require "base64"

class LtiV1Controller < ApplicationController
  # Don't require an authenticity token because LTI Platforms POST to this
  # controller.
  skip_before_action :verify_authenticity_token

  # [GET/POST] /lti/v1/login(/:platform_id)
  #
  # Most LTI Platforms should send a client_id as part of the login request.
  # However, it is not required per the LTI 1.3 spec. In these cases, we can
  # supply clients with a unique login URL (with a platform_id), so we can
  # identify the caller's identity. The requst will always contain the iss param,
  # as required by the LTI 1.3 standard
  # https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login
  def login
    if params[:client_id]
      query_params = {client_id: params[:client_id], issuer: params[:iss]}
    elsif params[:platform_id]
      query_params = {platform_id: params[:platform_id]}
    else
      return unauthorized_status
    end

    lti_integration = LtiIntegration.find_by(query_params)
    return unauthorized_status unless lti_integration

    state_and_nonce = create_state_and_nonce
    # set cache key as state value, since we get this back in the final response
    # from the LTI Platform, and can use it to query for these values in the
    # authenticate controller action.
    write_cache(state_and_nonce[:state], state_and_nonce)

    auth_redirect_url = URI(lti_integration[:auth_redirect_url])
    auth_redirect_url.query = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: lti_integration[:client_id],
      redirect_uri: CDO.studio_url('/lti/v1/authenticate', CDO.default_scheme),
      login_hint:  params[:login_hint],
      lti_message_hint: params[:lti_message_hint].to_s, # Required by Canvas
      state: state_and_nonce[:state],
      response_mode: 'form_post',
      nonce: state_and_nonce[:nonce],
      prompt: 'none',
    }.to_query

    redirect_to auth_redirect_url.to_s
  end

  def authenticate
    id_token = params[:id_token]
    return unauthorized_status unless id_token
    begin
      decoded_jwt_no_auth = JSON::JWT.decode(id_token, :skip_verification)
    rescue
      return unauthorized_status
    end
    # client_id is the aud[ience] in the JWT
    extracted_client_id = decoded_jwt_no_auth[:aud]
    extracted_issuer_id = decoded_jwt_no_auth[:iss]

    integration = LtiIntegration.find_by({client_id: extracted_client_id, issuer: extracted_issuer_id})
    return unauthorized_status unless integration

    # check state and nonce in response and id_token against cached values
    cached_state_and_nonce = read_cache params[:state]
    return unauthorized_status unless (params[:state] == cached_state_and_nonce[:state]) &&
      (decoded_jwt_no_auth[:nonce] == cached_state_and_nonce[:nonce])

    begin
      # verify the jwt via the integration's public keyset
      decoded_jwt = get_decoded_jwt(integration, id_token)
    rescue
      return unauthorized_status
    end

    jwt_verifier = JwtVerifier.new(decoded_jwt, integration)

    if jwt_verifier.verify_jwt
      message_type = decoded_jwt[:'https://purl.imsglobal.org/spec/lti/claim/message_type']
      return wrong_resource_type unless message_type == 'LtiResourceLinkRequest'

      target_link_uri = decoded_jwt[:'https://purl.imsglobal.org/spec/lti/claim/target_link_uri']
      redirect_to target_link_uri
    else
      return unauthorized_status
    end
  end

  def get_decoded_jwt(integration, id_token)
    public_jwk_url = integration.jwks_url
    response = JSON.parse(HTTParty.get(public_jwk_url).body)
    jwk_set = JSON::JWK::Set.new response
    JSON::JWT.decode(id_token, jwk_set)
  end

  private

  NAMESPACE = "lti_v1_controller".freeze

  def unauthorized_status
    render(status: :unauthorized, json: {error: 'Unauthorized'})
  end

  def wrong_resource_type
    render(status: :not_acceptable, json: {error: 'Only LtiResourceLink is supported right now'})
  end

  def create_state_and_nonce
    state = generate_random_string 10
    nonce = Digest::SHA2.hexdigest(generate_random_string(10))

    {state: state, nonce: nonce}
  end

  def write_cache(key, value)
    # TODO: Add error handling
    CDO.shared_cache.write("#{NAMESPACE}/#{key}", value.to_json, expires_in: 1.minute)
  end

  def read_cache(key)
    # TODO: Add error handling
    json_value = CDO.shared_cache.read("#{NAMESPACE}/#{key}")
    JSON.parse(json_value).symbolize_keys
  end

  def generate_random_string(length)
    SecureRandom.alphanumeric length
  end
end
