class RubricsController < ApplicationController
  load_and_authorize_resource

  def edit
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = @rubric.lesson
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
  end
end
