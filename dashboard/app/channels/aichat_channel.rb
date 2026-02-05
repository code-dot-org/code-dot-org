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

    request_attributes = AichatAiHelper.build_request_attributes(current_user.id, payload)

    request = AichatRequest.new(request_attributes)
    request.save!

    AichatRequestStreamJob.perform_later(
      request: request,
      stream_name: @stream_name,
      locale: locale
    )
  rescue StandardError => exception
    AichatAiHelper.handle_error("AichatChannel failed", exception.message, request, locale, STATUS[:FAILURE])
  end
end
