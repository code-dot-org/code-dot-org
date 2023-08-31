class RubricsController < ApplicationController
  def edit
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = @rubric.lesson
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
  end

  def submit_evaluations
    permitted_params = params.permit(:id, :student_id)
    learning_goal_ids = LearningGoal.where(rubric_id: permitted_params[:id]).pluck(:id)
    learning_goal_evaluations = LearningGoalEvaluation.where(user_id: permitted_params[:student_id], learning_goal_id: learning_goal_ids, teacher_id: current_user.id)
    submitted_at = Time.now
    if learning_goal_evaluations.update_all(submitted_at: submitted_at)
      render json: {submittedAt: submitted_at}
    else
      return head :bad_request
    end
  end
end
