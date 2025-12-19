class AichatChannel < ApplicationCable::Channel
  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS
  def subscribed
    reject unless current_user

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
    new_message = payload['newMessage'] || {}
    stored_messages = successful_stored_chat_messages(payload['storedMessages'])
    model_customizations = (payload['modelParameters'] || {})
    context = payload['aichatContext'] || {}
    locale = payload['locale'] || 'en'

    model_customizations['clientType'] ||= context['clientType']

    level_id = context['currentLevelId']
    project_id = project_id_from_context(context)

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

    AichatRequestStreamJob.perform_later(
      request_id: request.id,
      stream_name: @stream_name,
      locale: locale
    )
  rescue StandardError => exception
    request&.update!(response: exception.message, execution_status: STATUS[:FAILURE])
    Honeybadger.notify("AichatChannel streaming failed: #{exception.message}",
      context: {
        user_id: current_user&.id,
        locale: locale
      }
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
