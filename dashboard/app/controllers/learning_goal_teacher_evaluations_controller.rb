class LearningGoalTeacherEvaluationsController < ApplicationController
  load_and_authorize_resource

  def create
    @learning_goal_teacher_evaluation.update!(learning_goal_teacher_evaluation_params.merge(teacher_id: current_user.id))
    render json: @learning_goal_teacher_evaluation
  end

  def update
    @learning_goal_teacher_evaluation.update!(learning_goal_teacher_evaluation_params)
    return head :not_found unless @learning_goal_teacher_evaluation
    render json: @learning_goal_teacher_evaluation
  end

  def get_evaluation
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_by(
      user_id: learning_goal_teacher_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_teacher_evaluation_params[:learning_goal_id]
    )
    if learning_goal_teacher_evaluation&.teacher_id == current_user.id
      render json: learning_goal_teacher_evaluation
    else
      head :not_found
    end
  end

  def get_or_create_evaluation
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_or_create_by!(
      user_id: learning_goal_teacher_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_teacher_evaluation_params[:learning_goal_id],
    )
    render json: learning_goal_teacher_evaluation
  end

  private def learning_goal_teacher_evaluation_params
    eval_params = params.transform_keys(&:underscore)
    eval_params = eval_params.permit(
      :user_id,
      :learning_goal_id,
      :understanding,
      :feedback,
    )
    eval_params
  end
end
