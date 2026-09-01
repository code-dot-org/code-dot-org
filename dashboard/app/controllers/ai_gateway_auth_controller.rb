require 'jwt'
require 'securerandom' unless defined?(SecureRandom)

class AiGatewayAuthController < ApplicationController
  PRIVATE_KEY = CDO.ai_gateway_auth_key
  PASSPHRASE = CDO.ai_gateway_auth_key_passphrase

  # Cloudflare Turnstile enforcement mode. Resolved from DCDO once per token
  # request and published twice from that single read: as a signed JWT claim the
  # gateway worker enforces on, and as a response field the browser uses to
  # decide whether to solve a challenge. Because both come from one read in one
  # request, the two consumers can never disagree about what is required.
  #
  #   disabled - browser sends no token; worker skips validation entirely.
  #   monitor  - browser sends a token but proceeds without one on failure;
  #              worker records the outcome and rejects nothing. Used to measure
  #              how much traffic would fail before enforcing.
  #   enforce  - browser requires a token; worker rejects a missing or invalid
  #              one with 401.
  #
  # The worker has no access to DCDO, which is why the mode travels in the JWT.
  TURNSTILE_ENFORCEMENT_MODE_DCDO_KEY = 'ai-gateway-turnstile-enforcement-mode'.freeze
  TURNSTILE_ENFORCEMENT_MODES = %w[disabled monitor enforce].freeze
  TURNSTILE_ENFORCEMENT_MODE_DEFAULT = 'disabled'.freeze

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

    # Resolve the Turnstile mode once. Both the claim and the response field
    # below come from this single value.
    enforcement_mode = turnstile_enforcement_mode

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
        turnstile_enforcement_mode: enforcement_mode,
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSPHRASE),
      'RS256'
    )
    render json: {token: token, turnstileEnforcementMode: enforcement_mode}
  end

  # DCDO stores arbitrary JSON, so the value here may be any type. A YAML-loaded
  # `off` or `on` arrives as a boolean, and a typo arrives as an unrecognized
  # string. Anything outside TURNSTILE_ENFORCEMENT_MODES degrades to the default rather than
  # reaching the worker as a claim neither side knows how to interpret.
  private def turnstile_enforcement_mode
    mode = DCDO.get(TURNSTILE_ENFORCEMENT_MODE_DCDO_KEY, TURNSTILE_ENFORCEMENT_MODE_DEFAULT)
    TURNSTILE_ENFORCEMENT_MODES.include?(mode) ? mode : TURNSTILE_ENFORCEMENT_MODE_DEFAULT
  end
end
