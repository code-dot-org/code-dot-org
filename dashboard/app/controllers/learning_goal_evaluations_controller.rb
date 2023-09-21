class LearningGoalEvaluationsController < ApplicationController
  authorize_resource

  def create
    learning_goal_evaluation = LearningGoalEvaluation.new(learning_goal_evaluation_params)
    learning_goal_evaluation.teacher_id = current_user.id

    learning_goal_evaluation.save!

    render json: learning_goal_evaluation
  end

  def update
    params.require(:id)
    learning_goal_evaluation = LearningGoalEvaluation.find_by_id(params[:id])

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
