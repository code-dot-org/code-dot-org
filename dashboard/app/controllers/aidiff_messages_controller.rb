class AidiffMessagesController < ApplicationController
  load_and_authorize_resource
  before_action :verify_aidiff_message

  # params are
  # approval: boolean
  # flagged: boolean
  # POST /aidiff_messages/:id/submit_feedback
  def submit_feedback
    feedback =  if @aidiff_message.aidiff_message_feedback.nil?
                  @aidiff_message.create_aidiff_message_feedback!(teacher_id: current_user.id)
                else
                  @aidiff_message.aidiff_message_feedback
                end
    feedback.assign_attributes(feedback_params)

    begin
      feedback.save!
    rescue StandardError => exception
      return render(json: {error: exception.message}, status: :unprocessable_entity)
    end
    head :ok
  end

  private def verify_aidiff_message
    unless @aidiff_message
      return render(json: {message: "AI Differentiation message not found"}, status: :not_found)
    end
    unless @aidiff_message.aidiff_thread&.user_id == current_user.id
      return head :forbidden
    end
  end

  private def feedback_params
    params.permit(:approval, :flagged)
  end
end
