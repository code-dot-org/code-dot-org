class LearningGoalEvaluationsController < ApplicationController
  def create
    @learning_goal_evaluation = LearningGoalEvaluation.new(learning_goal_evaluation_params)
  end

  def learning_goal_evaluation_params
    params.require(:user_id, :level_id).permit(:teacher_id, :unit_id, :learning_goal_id, :understanding, :feedback)
  end
end
