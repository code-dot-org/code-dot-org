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

    # The gateway serves Gemini for generation (see shouldUseAiGateway), and the
    # token it mints is not bound to a model, so a token issued for one model can
    # be replayed against another. Refuse to mint at all when Gemini is blocked
    # rather than trusting a client-supplied model id we cannot enforce later.
    if current_user.us_only_aichat_models_disabled?
      return render status: :forbidden, json: {user_type: current_user.user_type, error: AichatRequestsController::MODEL_REGION_BLOCKED_ERROR}
    end

    token_id = SecureRandom.uuid
    hostname = CDO.dashboard_hostname
    user_id = current_user.id

    # Set a little in the past to account for time drift
    issued_at_time = (Time.now - 5.seconds).to_i
    # Expire in 1 minute — enough for every chat-shaped call.  Hackathon
    # AI Lessons runs long Gemini Pro generations (a full personalized
    # lesson arc can exceed a minute), so that client type alone gets a
    # longer window.
    ttl =
      if aichat_context[:clientType] == SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_LESSONS_HACKATHON]
        5.minutes
      else
        1.minute
      end
    expiration_time = (Time.now + ttl).to_i

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
