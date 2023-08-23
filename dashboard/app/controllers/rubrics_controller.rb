class RubricsController < ApplicationController
  include Rails.application.routes.url_helpers

  def edit
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = @rubric.lesson
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
    @rubric = Rubric.new
  end

  def create
    @rubric = Rubric.new(rubric_params)
    @lesson = @rubric.lesson
    if @rubric.save
      redirect_to(edit_rubric_path(@rubric.id))
      return @rubric.id
    else
      render :new
    end
  end

  def update
    @rubric = Rubric.find(params[:id])
    @lesson = @rubric.lesson
    # @rubric.update(rubric_params)
    # @rubric.reload

    if @rubric.update(rubric_params)
      redirect_to edit_rubric_path(@rubric.id), notice: 'Rubric was successfully updated.'
    else
      render :edit
    end
  end

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(:level_id, :lesson_id, learning_goals_attributes: [:learning_goal, :ai_enabled])
  end
end
