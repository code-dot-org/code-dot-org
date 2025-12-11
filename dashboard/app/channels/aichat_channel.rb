class AichatChannel < ApplicationCable::Channel
  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS
  def subscribed
    reject unless current_user
    stream_for current_user
  end

  # Expects payload similar to AichatRequestsController#start_chat_completion
  # but streams the response over ActionCable instead of enqueuing a job.
  def request_completion(data)
    payload = data.deep_stringify_keys
    new_message = payload['newMessage'] || {}
    stored_messages = Array(payload['storedMessages']).select do |message|
      message['status'] == SharedConstants::AI_INTERACTION_STATUS[:OK] &&
        message['chatMessageText'].present?
    end
    model_customizations = (payload['modelParameters'] || {})
    context = payload['aichatContext'] || {}
    locale = payload['locale'] || 'en'

    model_customizations['clientType'] ||= context['clientType']

    level_id = context['currentLevelId']
    project_id = project_id_from_context(context)

    user_text = new_message['chatMessageText']

    request = AichatRequest.create!(
      user_id: current_user.id,
      model_customizations: model_customizations,
      stored_messages: stored_messages,
      new_message: new_message,
      level_id: level_id,
      script_id: context['scriptId'],
      project_id: project_id,
      execution_status: STATUS[:RUNNING]
    )
    request_id = request.id

    user_toxicity = AichatSafetyHelper.find_toxicity(user_text, level_id, 'User')
    if user_toxicity
      request.update!(
        response: user_toxicity.to_json,
        execution_status: STATUS[:USER_PROFANITY]
      )
      return broadcast_error(STATUS[:USER_PROFANITY], request_id)
    end

    AichatChannel.broadcast_to(current_user, {event: 'start', request_id: request_id})

    full_response = AichatAiHelper.stream_assistant_response(
      model_customizations,
      stored_messages,
      new_message,
      level_id,
      project_id,
      current_user.id
    ) {|delta, raw_event| handle_stream_delta(delta, raw_event, request_id)}

    model_toxicity = AichatSafetyHelper.find_toxicity(full_response, level_id, 'Assistant')
    if model_toxicity
      request.update!(
        response: model_toxicity.to_json,
        execution_status: STATUS[:MODEL_PROFANITY]
      )
      return broadcast_error(STATUS[:MODEL_PROFANITY], request_id)
    end

    request.update!(
      response: full_response,
      execution_status: STATUS[:SUCCESS]
    )

    AichatChannel.broadcast_to(current_user, {event: 'complete', text: full_response, request_id: request_id})
  rescue OpenaiUserInputResponseTimeout => exception
    request&.update!(
      response: exception.message,
      execution_status: STATUS[:MODEL_TIMEOUT]
    )
    broadcast_error(STATUS[:MODEL_TIMEOUT], request_id, exception.message)
  rescue ArgumentError => exception
    request&.update!(
      response: exception.message,
      execution_status: STATUS[:FAILURE]
    )
    broadcast_error(STATUS[:FAILURE], request_id, exception.message)
  rescue StandardError => exception
    request&.update!(
      response: exception.message,
      execution_status: STATUS[:FAILURE]
    )
    Honeybadger.notify(
      "AichatChannel streaming failed: #{exception.message}",
      context: {
        user_id: current_user&.id,
        locale: locale
      }
    )
    broadcast_error(STATUS[:FAILURE], request_id, exception.message)
  end

  private def broadcast_error(code, request_id = nil, details = nil)
    AichatChannel.broadcast_to(current_user, {event: 'error', code: code, details: details, request_id: request_id})
  end

  private def handle_stream_delta(delta, raw_event, request_id)
    return if delta.blank?
    AichatChannel.broadcast_to(current_user, {event: 'delta', text: delta, raw_event: raw_event, request_id: request_id})
  end

  private def project_id_from_context(context)
    return context['projectId'] if context['projectId']
    return unless context['channelId']
    return unless defined?(storage_decrypt_channel_id)
    _, project_id = storage_decrypt_channel_id(context['channelId'])
    project_id
  rescue StandardError
    nil
  end
end
