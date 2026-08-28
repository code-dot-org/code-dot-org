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

    # Send the log token, not the raw id.
    user_log_token = current_user.log_token(destination: User::LogToken::SENTRY)

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
        user_log_token: user_log_token,
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
