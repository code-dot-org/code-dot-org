class RubricsController < ApplicationController
  include Rails.application.routes.url_helpers

  def edit
    puts 'started editing'
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = @rubric.lesson
    puts 'finished editing!'
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
    @rubric = Rubric.new
    # 1.times { @rubric.learning_goals.build }
  end

  def create
    @rubric = Rubric.new(rubric_params)
    @lesson = @rubric.lesson
    if @rubric.save
      puts 'saved'
      # redirect_to(edit_rubric_path(@rubric.id))
      return @rubric.id
    else
      puts @rubric.errors.full_messages
      puts 'rending new'
      render :new
    end
  end

  def update
    puts params[:id]
    @rubric = Rubric.find(params[:id])
    @lesson = @rubric.lesson
    puts @rubric
    # @rubric.update(rubric_params)
    # @rubric.reload

    if @rubric.update(rubric_params)
      puts 'Xinside if'
      redirect_to edit_rubric_path(@rubric.id), notice: 'Rubric was successfully updated.'
    else
      puts 'Xinside else'
      render :edit
    end
  end

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(:level_id, :lesson_id, learning_goals_attributes: [:learning_goal, :ai_enabled])
  end
end
