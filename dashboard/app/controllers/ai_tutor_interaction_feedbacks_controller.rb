class AiTutorInteractionFeedbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_ai_tutor_interaction
  before_action :authorize_feedback_creation, only: [:create]

  def create
    feedback = @ai_tutor_interaction.feedbacks.find_or_initialize_by(user_id: current_user.id)
    feedback.assign_attributes(feedback_params)

    if feedback.save
      render json: {status: 'success', message: 'Feedback saved successfully'}, status: :created
    else
      render json: {status: 'error', message: feedback.errors.full_messages.to_sentence}, status: :unprocessable_entity
    end
  end

  private def set_ai_tutor_interaction
    @ai_tutor_interaction = AiTutorInteraction.find_by(id: params[:ai_tutor_interaction_id])
    unless @ai_tutor_interaction
      render json: {status: 'error', message: 'AI Tutor interaction not found'}, status: :not_found
    end
  end

  private def authorize_feedback_creation
    interaction_user = User.find(@ai_tutor_interaction.user_id)
    unless current_user.id == @ai_tutor_interaction.user_id || interaction_user.student_of?(current_user)
      render json: {status: 'error', message: 'Not authorized to give feedback on this interaction'}, status: :forbidden
    end
  end

  private def feedback_params
    params.permit(:thumbsUp, :thumbsDown, :details).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end
