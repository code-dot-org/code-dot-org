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
    return fail_job(request, STATUS[:USER_PROFANITY], user_toxicity) if user_toxicity

    current_seq_id = 0

    full_response = AichatAiHelper.stream_assistant_response(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      level_id,
      request.project_id,
      request.user_id
    ) do |delta|
      next if delta.nil? || delta == ''
      current_seq_id += 1
      broadcast({event: 'delta', text: delta, request_id: request.id, seq: current_seq_id})
    end

    model_toxicity = AichatSafetyHelper.find_toxicity(full_response, level_id, 'Assistant')
    return fail_job(request, STATUS[:MODEL_PROFANITY], model_toxicity) if model_toxicity

    request.update!(
      response: full_response,
      execution_status: STATUS[:SUCCESS]
    )

    broadcast({event: 'complete', text: full_response, request_id: request.id})
  rescue OpenaiUserInputResponseTimeout => exception
    fail_job(request, STATUS[:MODEL_TIMEOUT], exception.message)
  rescue ArgumentError => exception
    fail_job(request, STATUS[:FAILURE], exception.message)
  rescue StandardError => exception
    fail_job(request, STATUS[:FAILURE], exception.message, exception: exception)
  end

  private def broadcast(payload)
    AichatAiHelper.broadcast_to_stream(@stream_name, payload)
  end

  private def fail_job(request, status_code, details, exception: nil)
    safe_details = serialize_details(details)
    request&.update!(
      response: safe_details,
      execution_status: status_code
    )

    AichatAiHelper.broadcast_error(@stream_name, status_code, request&.id, safe_details)

    if exception
      Honeybadger.notify(
        "AichatRequestStreamJob failed: #{exception.message}",
        context: {
          user_id: request&.user_id,
          request_id: request&.id,
          locale: @locale,
          status_code: status_code
        }
      )
    end
  end

  private def serialize_details(details)
    details.is_a?(String) ? details : details.to_json
  end
end
