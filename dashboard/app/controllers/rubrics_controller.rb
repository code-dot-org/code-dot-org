class RubricsController < ApplicationController
  def edit
    @rubric = Rubric.find_by(id: params[:id])
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
  end
end
