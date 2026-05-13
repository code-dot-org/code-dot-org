require 'jwt'
require 'securerandom' unless defined?(SecureRandom)

class AiGatewayAuthController < ApplicationController
  PRIVATE_KEY = CDO.ai_gateway_auth_key
  PASSPHRASE = CDO.ai_gateway_auth_key_passphrase

  # SPA clients fetch this token via fetch() without an embedded Rails CSRF
  # meta tag (the studio's index.html is served by Vite, not via the haml).
  # Authentication still gates the action via `current_user`, so the token
  # is scoped to the signed-in session.
  skip_before_action :verify_authenticity_token

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # POST /ai_gateway/access_token
  # ----------------------------

  def get_access_token
    unless current_user.can_access_aichat_chat_completion?(params[:aichatContext][:clientType], params[:aichatContext][:currentLevelId])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    token_id = SecureRandom.uuid
    hostname = CDO.dashboard_hostname
    user_id = current_user.id

    # Set a little in the past to account for time drift
    issued_at_time = (Time.now - 5.seconds).to_i
    # expire token in 1 minute
    expiration_time = (Time.now + 1.minute).to_i

    token = JWT.encode(
      {
        issued_at_time: issued_at_time,
        expiration_time: expiration_time,
        token_id: token_id,
        hostname: hostname,
        user_id: user_id,
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSPHRASE),
      'RS256'
    )
    render json: {token: token}
  end
end
