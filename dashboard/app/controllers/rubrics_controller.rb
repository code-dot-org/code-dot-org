class RubricsController < ApplicationController
  include Rails.application.routes.url_helpers

  before_action :require_levelbuilder_mode_or_test_env, except: [:submit_evaluations]
  load_and_authorize_resource except: [:submit_evaluations]

  # GET /rubrics/:rubric_id/edit
  def edit
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = @rubric.lesson
  end

  # GET /rubrics/new?lessonId=<lessonId>
  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
    @rubric = Rubric.new
  end

  # POST /rubrics
  def create
    @rubric = Rubric.new(rubric_params)
    @lesson = @rubric.lesson
    if @rubric.save
      @rubric.lesson.script.write_script_json
      render json: {redirectUrl: edit_rubric_path(@rubric.id), rubricId: @rubric.id}
    else
      render :new
    end
  end

  # TODO (Kaitie): Update the update action
  # PATCH /rubrics/:rubric_id
  def update
    @rubric = Rubric.find(params[:id])
    @lesson = @rubric.lesson

    if @rubric.update(rubric_params)
      redirect_to edit_rubric_path(@rubric.id), notice: 'Rubric was successfully updated.'
    else
      render :edit
    end
  end

  # POST /rubrics/:id/submit_evaluations
  def submit_evaluations
    return head :forbidden unless current_user&.teacher?
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

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(:level_id, :lesson_id, learning_goals_attributes: [:learning_goal, :ai_enabled, :position])
  end
end
