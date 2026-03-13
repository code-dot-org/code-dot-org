require 'jwt'
require 'securerandom' unless defined?(SecureRandom)

class AiGatewayAuthController < ApplicationController
  PRIVATE_KEY = CDO.ai_gateway_auth_key
  PASSPHRASE = CDO.ai_gateway_auth_key_passphrase

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # GET /ai_gateway/access_token
  # ----------------------------

  def get_access_token
    unless can_access_aichat_lab_chat_completion? || can_access_ai_tutor_chat_completion?(params[:aichatContext][:clientType])
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

  private def can_access_ai_tutor_chat_completion?(client_type)
    return false if DCDO.get("block_ai_tutor_chat_completion", false)
    current_user.trust_chat_client?(client_type)
  end

  private def can_access_aichat_lab_chat_completion?
    return false if DCDO.get("block_aichat_lab_chat_completion", false)
    current_user.has_aichat_lab_access?
  end
end
