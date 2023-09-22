class LearningGoalTeacherEvaluationsController < ApplicationController
  authorize_resource

  def create
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.new(learning_goal_teacher_evaluation_params)
    learning_goal_teacher_evaluation.teacher_id = current_user.id

    learning_goal_teacher_evaluation.save!

    render json: learning_goal_teacher_evaluation
  end

  def update
    params.require(:id)
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_by_id(params[:id])

    if learning_goal_teacher_evaluation&.teacher_id == current_user.id
      if learning_goal_teacher_evaluation.update(learning_goal_teacher_evaluation_params)
        render json: learning_goal_teacher_evaluation
      else
        head :bad_request
      end
    else
      head :not_found
    end
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
    lgep = params.transform_keys(&:underscore)
    lgep = lgep.permit(
      :user_id,
      :learning_goal_id,
      :understanding,
      :feedback,
    )
    lgep
  end
end
