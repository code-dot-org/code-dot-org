class LearningGoalEvaluationsController < ApplicationController
  def create
    learning_goal_evaluation = LearningGoalEvaluation.new(learning_goal_evaluation_params)

    learning_goal_evaluation.save!

    render json: learning_goal_evaluation
  end

  private def learning_goal_evaluation_params
    lgep = params.transform_keys(&:underscore)
    lgep = lgep.permit(
      :user_id,
      :teacher_id,
      :unit_id,
      :level_id,
      :learning_goal_id,
      :understanding,
      :feedback,
      :context
    )
    lgep
  end
end
