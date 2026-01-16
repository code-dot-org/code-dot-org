class AichatRequestStreamJob < ApplicationJob
  queue_as :default

  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  before_enqueue do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: STATUS[:QUEUED])
  end

  before_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: STATUS[:RUNNING])
    AichatAiHelper.report_job_start(self.class.name, request)
  end

  after_perform do |job|
    request = job.arguments.first[:request]
    AichatAiHelper.report_job_finish(self.class.name, request)
  end

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    request = arguments.first[:request]
    locale = arguments.first[:locale]

    fail_job(request, exception.message, STATUS[:FAILURE], locale)

    # Report metrics for the failed job (after_perform doesn't run on failure).
    AichatAiHelper.report_job_finish(self.class.name, request)

    # Re-raise error to notify our system of the failed job.
    raise exception
  end

  def perform(request:, stream_name:, locale:)
    @stream_name = stream_name

    broadcast({event: 'start', request_id: request.id})

    user_text = request.new_message['chatMessageText']
    level_id = request.level_id

    user_toxicity = AichatSafetyHelper.find_toxicity(user_text, level_id, 'User')
    return fail_job(request, serialize_details(user_toxicity),  STATUS[:USER_PROFANITY], locale) if user_toxicity

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
    return fail_job(request, serialize_details(model_toxicity), STATUS[:MODEL_PROFANITY], locale) if model_toxicity

    request.update!(
      response: full_response,
      execution_status: STATUS[:SUCCESS]
    )

    broadcast({event: 'complete', text: full_response, request_id: request.id})
  rescue OpenaiUserInputResponseTimeout => exception
    fail_job(request, exception.message, STATUS[:MODEL_TIMEOUT], locale)
  end

  private def broadcast(payload)
    AichatAiHelper.broadcast_to_stream(@stream_name, payload)
  end

  private def fail_job(request, details, status_code, locale)
    safe_details = serialize_details(details)
    AichatAiHelper.handle_error("AichatRequestStreamJob failed", safe_details, request, locale, status_code)

    AichatAiHelper.broadcast_error(@stream_name, status_code, request&.id, safe_details)
  end

  private def serialize_details(details)
    details.is_a?(String) ? details : details.to_json
  end
end
