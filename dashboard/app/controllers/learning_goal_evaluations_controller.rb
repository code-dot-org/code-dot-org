class LearningGoalEvaluationsController < ApplicationController
  authorize_resource

  def create
    learning_goal_evaluation = LearningGoalEvaluation.new(learning_goal_evaluation_params)
    learning_goal_evaluation.teacher_id = current_user.id
    learning_goal_evaluation.created_at = DateTime.current

    learning_goal_evaluation.save!

    render json: learning_goal_evaluation
  end

  def update
    learning_goal_evaluation = LearningGoalEvaluation.find(params[:id])

    if learning_goal_evaluation&.teacher_id == current_user.id
      if learning_goal_evaluation.update(learning_goal_evaluation_params)
        render json: learning_goal_evaluation
      else
        head :bad_request
      end
    else
      head :not_found
    end
  end

  def get_evaluation
    learning_goal_evaluation = LearningGoalEvaluation.find_by(
      user_id: learning_goal_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_evaluation_params[:learning_goal_id]
    )

    if learning_goal_evaluation&.teacher_id == current_user.id
      render json: learning_goal_evaluation
    else
      head :not_found
    end
  end

  def get_or_create_evaluation
    learning_goal_evaluation = LearningGoalEvaluation.find_or_create_by(
      user_id: learning_goal_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_evaluation_params[:learning_goal_id]
    )
    if learning_goal_evaluation.created_at
      render json: learning_goal_evaluation
    else
      learning_goal_evaluation.created_at = DateTime.current
      learning_goal_evaluation.save!
      render json: learning_goal_evaluation
    end
  end

  def index
    learning_goal_evaluations = LearningGoalEvaluation.all
    render json: learning_goal_evaluations
  end

  def show
    learning_goal_evaluations = LearningGoalEvaluation.find(params[:id])
    render json: learning_goal_evaluations
  end

  private def learning_goal_evaluation_params
    lgep = params.transform_keys(&:underscore)
    lgep = lgep.permit(
      :user_id,
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
