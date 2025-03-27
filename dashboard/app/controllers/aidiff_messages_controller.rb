class AidiffMessagesController < ApplicationController
  before_action :set_aidiff_message
  load_and_authorize_resource

  # params are
  # aidiff_message_id: int
  # approval: boolean
  # flagged: boolean
  # POST /aidiff_message/:aidiff_message_id/submit_feedback
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

  private def set_aidiff_message
    @aidiff_message = AidiffMessage.find_by(id: params[:aidiff_message_id])
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
