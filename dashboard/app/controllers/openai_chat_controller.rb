# A controller for handling requests to the OpenAI chat completion API.

class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # Allowed number of unique requests per minute before that client is throttled.
  # Theis value is a fallback for the DCDO-configured value used below.
  REQUEST_LIMIT_PER_MIN_DEFAULT = 100

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    messages = params[:messages]
    id = current_user&.id || session.id

    limit = DCDO.get('openai_chat_request_limit_per_min_default', REQUEST_LIMIT_PER_MIN_DEFAULT)
    period = 60
    OpenaiChatHelper.throttled_request_chat_completion(messages, id, limit, period) do |response|
      chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
      return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
    end

    # If we make it here, the request should be throttled.
    Honeybadger.notify(
      error_class: 'RequestThrottledWarning',
      error_message: "Client throttled for POST #{request.path}",
      context: {throttle_id: id, limit: limit, period: period}
    )
    head :too_many_requests
  end

  def has_required_messages_param?
    params[:messages].present?
  end
end
