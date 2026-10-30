class LearningGoalTeacherEvaluationsController < ApplicationController
  load_and_authorize_resource
  before_action :authorize_student!

  def create
    @learning_goal_teacher_evaluation.update!(eval_params.merge(teacher_id: current_user.id))
    render json: @learning_goal_teacher_evaluation
  end

  def update
    @learning_goal_teacher_evaluation.update!(update_params)
    return head :not_found unless @learning_goal_teacher_evaluation
    render json: @learning_goal_teacher_evaluation
  end

  def get_evaluation
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_by(
      user_id: eval_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: eval_params[:learning_goal_id]
    )
    if learning_goal_teacher_evaluation&.teacher_id == current_user.id
      render json: learning_goal_teacher_evaluation
    else
      head :not_found
    end
  end

  def get_or_create_evaluation
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_or_create_by!(
      user_id: eval_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: eval_params[:learning_goal_id],
    )
    render json: learning_goal_teacher_evaluation
  end

  # load_and_authorize_resource only confirms the evaluation's teacher_id is the
  # current user; it does not confirm the targeted student is actually one of
  # the teacher's students. Without this check a teacher can create, read, and
  # modify rubric feedback for any student id, regardless of section membership.
  private def authorize_student!
    student_id =
      if @learning_goal_teacher_evaluation&.persisted?
        @learning_goal_teacher_evaluation.user_id
      else
        eval_params[:user_id]
      end
    head :forbidden unless current_user&.students&.exists?(id: student_id)
  end

  private def eval_params
    params.transform_keys(&:underscore).permit(
      :user_id,
      :learning_goal_id,
      :understanding,
      :feedback,
    )
  end

  private def update_params
    params.transform_keys(&:underscore).permit(
      :understanding,
      :feedback,
      )
  end
end
