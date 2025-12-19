class AichatRequestStreamJob < ApplicationJob
  queue_as :default

  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  def perform(request_id:, stream_name:, locale:)
    @stream_name = stream_name
    request = nil
    request = AichatRequest.find(request_id)

    request.update!(execution_status: STATUS[:RUNNING])
    broadcast({event: 'start', request_id: request.id})

    user_text = request.new_message['chatMessageText']
    level_id = request.level_id

    user_toxicity = AichatSafetyHelper.find_toxicity(user_text, level_id, 'User')
    return update_and_broadcast_error(request, STATUS[:USER_PROFANITY], user_toxicity) if user_toxicity

    current_seq_id = 0

    full_response = AichatAiHelper.stream_assistant_response(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      level_id,
      request.project_id,
      request.user_id
    ) do |delta, raw_event|
      next if delta.nil? || delta == ''
      current_seq_id += 1
      broadcast({event: 'delta', text: delta, raw_event: raw_event, request_id: request.id, seq: current_seq_id})
    end

    model_toxicity = AichatSafetyHelper.find_toxicity(full_response, level_id, 'Assistant')
    return update_and_broadcast_error(request, STATUS[:MODEL_PROFANITY], model_toxicity) if model_toxicity

    request.update!(
      response: full_response,
      execution_status: STATUS[:SUCCESS]
    )

    broadcast({event: 'complete', text: full_response, request_id: request.id})
  rescue OpenaiUserInputResponseTimeout => exception
    update_and_broadcast_error(request, STATUS[:MODEL_TIMEOUT], exception.message)
  rescue ArgumentError => exception
    update_and_broadcast_error(request, STATUS[:FAILURE], exception.message)
  rescue StandardError => exception
    request&.update!(response: exception.message, execution_status: STATUS[:FAILURE])
    Honeybadger.notify(
      "AichatRequestStreamJob failed: #{exception.message}",
      context: {
        user_id: user_id,
        locale: locale,
        request_id: request_id
      }
    )
    AichatAiHelper.broadcast_error(@stream_name,  STATUS[:FAILURE], request&.id, exception.message)
  end

  private def broadcast(payload)
    AichatAiHelper.broadcast_to_stream(@stream_name, payload)
  end

  private def update_and_broadcast_error(request, status_code, details)
    request.update!(response: serialize_details(details), execution_status: status_code)
    AichatAiHelper.broadcast_error(@stream_name, status_code, request.id, details)
  end

  private def serialize_details(details)
    details.is_a?(String) ? details : details.to_json
  end
end
