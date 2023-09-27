class LearningGoalAiEvaluationsController < ApplicationController
  # GET /learning_goal_ai_evaluations/get_evaluation
  def get_evaluation
    student = User.find(learning_goal_ai_evaluation_params[:user_id])
    return head :not_found unless student
    return head :forbidden unless can?(:manage, student)

    evaluation = LearningGoalAiEvaluation.find_by(
      user_id: student.id,
      learning_goal_id: learning_goal_ai_evaluation_params[:learning_goal_id]
    )

    return head :not_found unless evaluation
    render json: evaluation.summarize_for_instructor
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
