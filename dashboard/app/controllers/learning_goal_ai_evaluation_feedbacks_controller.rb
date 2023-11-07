class LearningGoalAiEvaluationFeedbacksController < ApplicationController
  load_and_authorize_resource

  def create
    @learning_goal_ai_evaluation_feedback.create!(ai_eval_feedback_params.merge(teacher_id: current_user.id))
    render json: @learning_goal_ai_evaluation_feedback
  end

  def update
    @learning_goal_ai_evaluation_feedback.update!(ai_eval_feedback_params.merge(teacher_id: current_user.id))
    return head :not_found unless @learning_goal_ai_evaluation_feedback
    render json: @learning_goal_ai_evaluation_feedback
  end

  private def ai_eval_feedback_params
    feedback_params = params.transform_keys(&:underscore)
    feedback_params = feedback_params.permit(
      :learning_goal_ai_evaluation_id,
      :ai_feedback_approval,
      :false_positive,
      :false_negative,
      :vague,
      :feedback_other,
      :other_content,
    )
    feedback_params
  end
end
