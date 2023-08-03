class RubricsController < ApplicationController
  def edit
    @rubric = Rubric.find_by(id: params[:id])
    @lesson = Lesson.find_by(id: @rubric.lesson_id)
  end

  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
  end
end
