class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  skip_before_action :verify_authenticity_token

  # POST /ai_tutor_interactions
  def create
    puts "ai_tutor_interaction_params"
    pp ai_tutor_interaction_params
    # @ai_tutor_interaction = AiTutorInteraction.new(params)
  end

  def ai_tutor_interaction_params
    ai_tutor_interaction_params = params.transform_keys(&:underscore).permit(
      :level_id,
      :script_id,
      :type,
      :prompt,
      :status,
      :ai_response
    )
    ai_tutor_interaction_params[:user_id] = current_user.id
    ai_tutor_interaction_params[:ai_model_version] = SharedConstants::AI_TUTOR_CHAT_MODEL_VERISON
    ai_tutor_interaction_params
  end
end
