class LearningGoalsController < ApplicationController
  include Rails.application.routes.url_helpers

  def edit
  end

  def new
    authorize! :create, LearningGoal
    @rubric = Rubric.new(rubric_params)
    @learning_goal = LearningGoal.new
  end

  def create
  end

  def update
    puts params[:id]
    @rubric = Rubric.find(params[:id])
    @lesson = @rubric.lesson
    puts @rubric
    # @rubric.update(rubric_params)
    # @rubric.reload
    if @rubric.update(rubric_params)
      puts 'inside if'
      redirect_to edit_rubric_path(@rubric.id), notice: 'Rubric was successfully updated.'
    else
      puts 'inside else'
      render :edit
    end
  end

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(:level_id, :lesson_id)
  end
end
