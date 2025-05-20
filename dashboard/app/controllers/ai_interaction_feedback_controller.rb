class AiInteractionFeedbackController < ApplicationController
  before_action :authenticate_user!

  def create
    feedback = AiInteractionFeedback.new(feedback_params)

    feedback.user_id = current_user.id
    feedback.school_year = school_year

    if feedback.save
      render json: {status: 'success', message: 'Feedback saved successfully'}, status: :created
    else
      render json: {status: 'error', message: feedback.errors.full_messages.to_sentence}, status: :unprocessable_entity
    end
  end

  private def feedback_params
    params.permit(
      :aiInteractionType,
      :aiInteractionId,
      :levelId,
      :scriptId,
      :thumbsUp,
      :schoolYear,
      metadata: {}
    ).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end
