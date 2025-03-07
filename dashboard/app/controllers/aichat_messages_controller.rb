class AichatMessagesController < ApplicationController
  before_action :set_aichat_message
  load_and_authorize_resource

  # params are
  # aichat_message_id: int
  # approval: boolean
  # flagged: boolean
  # POST /aichat_message/:aichat_message_id/submit_feedback
  def submit_feedback
    feedback =  if @aichat_message.aichat_message_feedback.nil?
                  @aichat_message.create_aichat_message_feedback!(teacher_id: current_user.id)
                else
                  @aichat_message.aichat_message_feedback
                end
    feedback.assign_attributes(feedback_params)

    begin
      feedback.save!
    rescue StandardError => exception
      return render(json: {error: exception.message}, status: :unprocessable_entity)
    end
    head :ok
  end

  private def set_aichat_message
    @aichat_message = AichatMessage.find_by(id: params[:aichat_message_id])
    unless @aichat_message
      return render(json: {message: "AI Differentiation message not found"}, status: :not_found)
    end
    unless @aichat_message.aichat_thread&.user_id == current_user.id
      return head :forbidden
    end
  end

  private def feedback_params
    params.permit(:approval, :flagged)
  end
end
