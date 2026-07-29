require 'jwt'
require 'securerandom' unless defined?(SecureRandom)

class AiGatewayAuthController < ApplicationController
  PRIVATE_KEY = CDO.ai_gateway_auth_key
  PASSPHRASE = CDO.ai_gateway_auth_key_passphrase

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # POST /ai_gateway/access_token
  # ----------------------------

  def get_access_token
    aichat_context = params[:aichatContext]

    unless current_user.can_access_aichat_chat_completion?(aichat_context[:clientType], aichat_context[:currentLevelId])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    # The gateway is the only backend for some models (e.g. Gemini image gen),
    # so token minting is where regional model blocks are enforced for the
    # client-direct path.
    model_id = params[:selectedModelId]
    if model_id.present? && !current_user.can_use_aichat_model?(model_id)
      return render status: :forbidden, json: {error: AichatRequestsController::MODEL_REGION_BLOCKED_ERROR}
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
        aichat_client_type: aichat_context[:clientType],
        level_id: aichat_context[:currentLevelId],
        script_id: aichat_context[:scriptId],
        channel_id: aichat_context[:channelId],
        lesson_id: aichat_context[:lessonId],
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSPHRASE),
      'RS256'
    )
    render json: {token: token}
  end
end
