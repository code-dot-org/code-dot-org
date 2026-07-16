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

    safety_checks_disabled = ActiveModel::Type::Boolean.new.cast(aichat_context[:disableSafetyChecks]) == true
    if safety_checks_disabled && !current_user.can_disable_aichat_safety_checks?
      return render status: :forbidden, json: {
        error: 'safety_checks_bypass_not_permitted',
        message: 'Requested an AI Gateway token with content-safety checks disabled, but the current user does not have permission to disable them.',
      }
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
        safety_checks_disabled: safety_checks_disabled,
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSPHRASE),
      'RS256'
    )
    render json: {token: token}
  end
end
