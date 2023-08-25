class RubricsController < ApplicationController
  include Rails.application.routes.url_helpers

  before_action :require_levelbuilder_mode_or_test_env

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
    puts rubric_params
    if @rubric.save
      @rubric.lesson.script.write_script_json
      render json: {redirectUrl: edit_rubric_path(@rubric.id)}
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

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(:level_id, :lesson_id, learning_goals_attributes: [:learning_goal, :ai_enabled, :position])
  end
end
