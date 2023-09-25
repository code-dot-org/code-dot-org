class LearningGoalAiEvaluationsController < ApplicationController
  def get_evaluation
    student = User.find(params[:user_id])
    return head :not_found unless student
    return head :forbidden unless can?(:manage, student)

    learning_goal = LearningGoal.find(params[:learning_goal_id])
    return head :not_found unless learning_goal

    evaluation = LearningGoalAiEvaluation.find_by(
      user_id: student.id,
      learning_goal_id: learning_goal.id
    )

    return head :not_found unless evaluation
    render json: evaluation
  end

  private

  def learning_goal_ai_evaluation_params
    permitted_params = params.transform_keys(&:underscore)
    permitted_params = permitted_params.permit(
      :user_id,
      :learning_goal_id,
    )
    permitted_params
  end
end
