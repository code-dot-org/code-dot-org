class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # Allowed number of unique requests per minute before that client is throttled.
  # These values are fallbacks for DCDO-configured values used below.
  REQUEST_LIMIT_PER_MIN_DEFAULT = 100
  REQUEST_LIMIT_PER_MIN_IP = 1000

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    messages = params[:messages]
    id = current_user&.id || session.id

    # Only throttle by IP if neither user nor session ID is available.
    throttle_ip = id.blank?
    id ||= request.IP
    limit = throttle_ip ?
      DCDO.get('openai_chat_request_limit_per_min_ip', REQUEST_LIMIT_PER_MIN_IP) :
      DCDO.get('openai_chat_request_limit_per_min_default', REQUEST_LIMIT_PER_MIN_DEFAULT)
    period = 60
    OpenaiChatHelper.throttled_request_chat_completion(messages, id, limit, period) do |response|
      chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
      return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
    end

    # If we make it here, the request should be throttled.
    Honeybadger.notify(
      error_class: 'RequestThrottledWarning',
      error_message: "Client throttled for POST #{request.path}",
      context: {throttle_id: id, is_ip: throttle_ip, limit: limit, period: period}
    )
    head :too_many_requests
  end

  private def has_required_messages_param?
    begin
      params.require([:messages])
    rescue ActionController::ParameterMissing
      return false
    end

    true
  end
end
