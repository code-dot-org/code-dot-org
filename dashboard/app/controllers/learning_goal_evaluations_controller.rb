class LearningGoalEvaluationsController < ApplicationController
  def create
    learning_goal_evaluation = LearningGoalEvaluation.new(learning_goal_evaluation_params)

    if learning_goal_evaluation.save
      render json: learning_goal_evaluation
    else
      render status: :bad_request, json: {error: learning_goal_evaluation.errors.full_message.to_json}
    end
  end

  def learning_goal_evaluation_params
    params.transform_keys(&:underscore).require(:user_id, :level_id, :unit_id, :learning_goal_id).permit(:teacher_id, :understanding, :feedback, :context)
  end
end
