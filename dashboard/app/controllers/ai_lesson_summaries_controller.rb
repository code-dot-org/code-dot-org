class AiLessonSummariesController < ApplicationController
  before_action :authenticate_user!

  # GET /ai_lesson_summaries/show?lesson_id=2
  def show
    @ai_lesson_summary = AiLessonSummary.find_by(
      user_id: current_user.id,
      lesson_id: params[:lesson_id]
    )

    if @ai_lesson_summary
      render json: @ai_lesson_summary.as_json(include: :lesson)
    else
      render json: {error: 'AI lesson summary not found'}, status: :not_found
    end
  end

  def perform_ai_lesson_summaries_by_unit
    unit = Unit.find(params[:unit_id])
    lesson_ids = []
    unit.lessons.each do |lesson|
      if lesson.has_lesson_plan
        lesson_ids << lesson.id
      end
    end
    request = {
      user_id: current_user.id,
      lesson_ids: lesson_ids,
      unit_id: unit.id
    }
    AiLessonSummariesJob.perform_later(request: request)
  end

  def perform_ai_lesson_summary_by_lesson
    lesson = Lesson.find(params[:lesson_id])
    if lesson.has_lesson_plan
      request = {
        user_id: current_user.id,
        lesson_ids: [lesson.id],
        unit_id: params[:unit_id]
      }
      AiLessonSummariesJob.perform_later(request: request)
    end
  end

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
