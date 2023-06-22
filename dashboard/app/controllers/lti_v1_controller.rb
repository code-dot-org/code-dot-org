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

    auth_redirect_url = URI(lti_integration[:auth_redirect_url])
    auth_redirect_url.query = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: lti_integration[:client_id],
      redirect_uri: CDO.studio_url('/lti/v1/authenticate', CDO.default_scheme),
      login_hint:  params[:login_hint],
      lti_message_hint: params[:lti_message_hint].to_s, # Required by Canvas
      state: create_and_set_state,
      response_mode: 'form_post',
      nonce: create_and_set_nonce,
      prompt: 'none',
    }.to_query

    redirect_to auth_redirect_url.to_s
  end

  private

  def unauthorized_status
    render(status: :unauthorized, json: {error: 'Unauthorized'})
  end

  def create_and_set_nonce
    # generate nonce, this will be set as a cookie.
    nonce = generate_random_string 10
    # generate hashed nonce, this will be returned to the LTI Platform in the
    # request params https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
    hashed_nonce = Digest::SHA2.hexdigest nonce
    set_cookie('nonce', nonce)

    hashed_nonce
  end

  def create_and_set_state
    state = generate_random_string 10
    set_cookie('state', state)

    state
  end

  def set_cookie(name, value)
    cookies[:"#{name}"] = {
      value: value,
      httponly: true,
      same_site: :strict,
    }
  end

  def generate_random_string(length)
    SecureRandom.alphanumeric length
  end
end
