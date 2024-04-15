class AiTutorInteractionFeedbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_ai_tutor_interaction
  before_action :authorize_feedback_creation, only: [:create]

  def create
    # Merge the user id with other feedback parameters to ensure the interaction is associated with the current user
    feedback_data = feedback_params.merge(user_id: current_user.id)
    feedback = @ai_tutor_interaction.feedbacks.new(feedback_data)

    if feedback.save
      render json: {status: 'success', message: 'Feedback saved successfully'}, status: :created
    else
      render json: {status: 'error', message: feedback.errors.full_messages.to_sentence}, status: :unprocessable_entity
    end
  end

  private def set_ai_tutor_interaction
    @ai_tutor_interaction = AiTutorInteraction.find(params[:ai_tutor_interaction_id])
  end

  private def authorize_feedback_creation
    interaction_user = User.find(@ai_tutor_interaction.user_id)
    unless current_user.id == @ai_tutor_interaction.user_id || interaction_user.student_of?(current_user)
      render json: {status: 'error', message: 'Not authorized to give feedback on this interaction'}, status: :forbidden
    end
  end

  private def feedback_params
    params.require(:feedback).permit(:thumbs_up, :thumbs_down)
  end
end
