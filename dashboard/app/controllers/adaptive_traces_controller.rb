# Relays one adaptive shell generation from the browser into Langfuse. The
# browser calls the AI gateway directly, so Rails never sees the call; this
# is where the user is established and the payload is bounded before export.
class AdaptiveTracesController < ApplicationController
  before_action :authenticate_user!

  TRACE_NAMES = %w[adaptive-instructions].freeze
  OUTCOMES = %w[success schema_mismatch error].freeze
  # Unknown metadata keys are dropped rather than refused, so a client ahead of
  # or behind this list still gets its trace recorded.
  METADATA_KEYS = %w[pathwayId checkpointId stepId scriptId inputsHash promptVersion responseId].freeze
  USAGE_KEYS = %w[input output total].freeze
  TRACE_ID_FORMAT = /\A\h{32}\z/
  # The prompt carries the student's project source; longer text is cut, not refused.
  MAX_TEXT_LENGTH = 100_000
  MAX_MESSAGE_LENGTH = 1_000

  # POST /adaptive/traces
  def create
    body = params.to_unsafe_h
    client_type = SharedConstants::AI_CHAT_CLIENT_TYPES[:ADAPTIVE]
    unless current_user.can_access_aichat_chat_completion?(client_type, body['levelId'])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    error = validation_error(body)
    return render status: :bad_request, json: {error: error} if error

    LangfuseHelper.trace_adaptive_generation(
      trace_id: body['traceId'],
      trace_name: body['traceName'],
      user_id: current_user.id,
      model: body['model'],
      input: truncate(body['prompt'].to_s, MAX_TEXT_LENGTH),
      output: bounded_output(body['output']),
      outcome: body['outcome'],
      error_message: body['errorMessage'].presence && truncate(body['errorMessage'].to_s, MAX_MESSAGE_LENGTH),
      usage: usage_from(body['usage']),
      metadata: metadata_from(body['metadata']).merge(level_id: body['levelId']),
      start_time: Time.at(body['startedAt'] / 1000.0),
      end_time: Time.at(body['endedAt'] / 1000.0),
    )
    render json: {traceId: body['traceId']}
  end

  private def validation_error(body)
    return 'traceId must be 32 hex characters' unless body['traceId'].to_s.match?(TRACE_ID_FORMAT)
    return 'unknown traceName' unless TRACE_NAMES.include?(body['traceName'])
    return 'unknown outcome' unless OUTCOMES.include?(body['outcome'])
    return 'model is required' if body['model'].blank?
    return 'startedAt and endedAt must be epoch milliseconds' unless body['startedAt'].is_a?(Numeric) && body['endedAt'].is_a?(Numeric)
    nil
  end

  private def metadata_from(metadata)
    return {} unless metadata.is_a?(Hash)
    # to_h drops the params hash's indifferent access, so the keys stay symbols.
    metadata.slice(*METADATA_KEYS).to_h.
      select {|_, value| scalar?(value)}.
      transform_keys {|key| key.underscore.to_sym}
  end

  private def usage_from(usage)
    return nil unless usage.is_a?(Hash)
    counts = usage.slice(*USAGE_KEYS).to_h.select {|_, value| value.is_a?(Integer)}
    counts.presence&.transform_keys(&:to_sym)
  end

  # Structured output arrives as JSON of the generation's own shape; it is
  # passed through whole unless it is oversized, in which case its text is cut.
  private def bounded_output(output)
    return nil if output.nil?
    return truncate(output, MAX_TEXT_LENGTH) if output.is_a?(String)
    serialized = output.to_json
    serialized.length > MAX_TEXT_LENGTH ? truncate(serialized, MAX_TEXT_LENGTH) : output
  end

  private def scalar?(value)
    value.is_a?(String) || value.is_a?(Numeric) || value == true || value == false
  end

  private def truncate(text, limit)
    text.length > limit ? "#{text[0, limit]}…[truncated]" : text
  end
end
