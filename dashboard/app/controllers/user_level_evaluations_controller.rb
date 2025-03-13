require 'json'

class UserLevelEvaluationsController < ApplicationController
  include LevelsHelper
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :user_level_evaluation

  # POST /user_level_evaluations
  def create
    @user_level_evaluation = UserLevelEvaluation.new(user_level_evaluation_params)
    if @user_level_evaluation.save
      render(status: :created, json: {message: "Successfully created UserLevelEvaluation.", id: @user_level_evaluation.id})
    else
      render(status: :not_acceptable, json: {error: @user_level_evaluation.errors.full_messages})
    end
  end

  def user_level_evaluation_params
    user_level_evaluation_params = params.transform_keys(&:underscore).permit(
      :user_id,
      :level_id,
      :script_id,
      :evaluation_criteria,
      :ai_evaluation,
      :ai_reasoning,
      :ai_model_version,
    )
    user_level_evaluation_params[:script_id] = params["unitId"]
    user_level_evaluation_params[:school_year] = school_year
    # We're currently 'borrowing' the AI Tutor openAI model implementation.
    # TODO: update to an EVALUATE_STUDENT_LEARNING_MODEL_VERSION when we settle on a model.
    user_level_evaluation_params[:ai_model_version] = SharedConstants::AI_TUTOR_CHAT_MODEL_VERSION
    user_level_evaluation_params
  end
end
