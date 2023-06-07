class LtiV1Controller < ApplicationController
  # Don't require an authenticity token because LTI Platforms POST to this controller.
  skip_before_action :verify_authenticity_token

  # [GET/POST] /lti/v1/login(/:platform_id)
  def login
    if params[:client_id]
      query_params = {client_id: params[:client_id], issuer: params[:iss]}
    elsif params[:platform_id]
      query_params = {platform_id: params[:platform_id]}
    else
      return unauthorized_status
    end

    begin
      lti_integration = LtiIntegration.find_by!(query_params)
    rescue ActiveRecord::RecordNotFound
      return unauthorized_status
    end

    auth_request_body = {
      scope: "openid",
      response_type: "id_token",
      client_id: lti_integration[:client_id],
      redirect_uri: "https://studio.code.org/lti/v1/authenticate", # TODO: where can we configure this to be dynamic depending on deployment environment, i.e. prod, localhost, etc?
      login_hint:  params[:login_hint],
      lti_message_hint: params[:lti_message_hint] ? params[:lti_message_hint] : "", # TODO: is this needed? Canvas sends it, what happens if we don't send it back? What about other LTI Platforms?
      state: create_and_set_state,
      response_mode: "form_post",
      nonce: create_and_set_nonce,
      prompt: "none",
    }

    auth_request_params = auth_request_body.to_query
    auth_redirect_url = lti_integration[:auth_redirect_url]

    redirect_to "#{auth_redirect_url}?#{auth_request_params}"
  end

  private def unauthorized_status
    render(status: :unauthorized, json: {error: "Unauthorized"})
  end

  private def create_and_set_nonce
    # generate nonce, this will be set as a cookie.
    nonce = generate_random_string 10
    # generate hashed nonce, this will be returned to the LTI Platform in the
    # request params https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
    hashed_nonce = Digest::SHA2.hexdigest nonce
    set_cookie("nonce", nonce)

    return hashed_nonce
  end

  private def create_and_set_state
    state = generate_random_string 10
    set_cookie("state", state)

    return state
  end

  private def set_cookie(name, value)
    cookies[:"#{name}"] = {
      value: value,
      httponly: true,
      same_site: :strict,
    }
  end

  private def generate_random_string(length)
    SecureRandom.alphanumeric length
  end
end
