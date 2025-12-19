class AichatChannel < ApplicationCable::Channel
  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  def subscribed
    return reject unless current_user

    stream_id = params[:stream_id]
    if stream_id.present?
      @stream_name = "aichat_stream:#{current_user.id}:#{stream_id}"
      stream_from @stream_name
    else
      reject
    end
  end

  # Expects payload similar to AichatRequestsController#start_chat_completion
  # but streams the response over ActionCable via an ActiveJob
  def request_completion(data)
    payload = data.deep_stringify_keys

    locale  = payload['locale'] || 'en'

    request_attributes = build_request_attributes(payload)

    request = AichatRequest.new(request_attributes)
    request.save!

    AichatRequestStreamJob.perform_later(
      request_id: request.id,
      stream_name: @stream_name,
      locale: locale
      )
  rescue StandardError => exception
    handle_error(exception, request, locale)
  end

  private def build_request_attributes(payload)
    context = payload['aichatContext'] || {}
    model_customizations = payload['modelParameters'] || {}
    model_customizations['clientType'] ||= context['clientType']

    {
      user_id:            current_user.id,
      model_customizations: model_customizations,
      stored_messages:    successful_stored_chat_messages(payload['storedMessages']),
      new_message:        payload['newMessage'] || {},
      level_id:           context['currentLevelId'],
      script_id:          context['scriptId'],
      project_id:         project_id_from_context(context),
      execution_status:   STATUS[:RUNNING]
    }
  end

  private def handle_error(exception, request, locale)
    request&.execution_status = STATUS[:FAILURE]
    request&.response = exception.message
    request&.save()

    Honeybadger.notify("AichatChannel streaming failed: #{exception.message}",
      context: {user_id: current_user&.id, locale: locale}
    )

    AichatAiHelper.broadcast_error(@stream_name, STATUS[:FAILURE], request&.id, exception.message)
  end

  private def successful_stored_chat_messages(stored_messages)
    Array(stored_messages).select do |message|
      message['status'] == SharedConstants::AI_INTERACTION_STATUS[:OK] &&
        message['chatMessageText'].present?
    end
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
