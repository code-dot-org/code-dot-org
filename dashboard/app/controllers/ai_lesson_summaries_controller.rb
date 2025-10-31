class AiLessonSummariesController < ApplicationController
  before_action :authenticate_user!

  # GET /ai_lesson_summaries/show?user_id=1&lesson_id=2
  def show
    @ai_lesson_summary = AiLessonSummary.find_by(
      user_id: params[:user_id],
      lesson_id: params[:lesson_id]
    )

    if @ai_lesson_summary
      render json: @ai_lesson_summary.as_json(include: :lesson)
    else
      render json: {error: 'AI lesson summary not found'}, status: :not_found
    end
  end

  def perform_ai_lesson_summaries_by_unit(unit_id)
    unit = Unit.find(unit_id)
    lesson_ids = []
    unit.lessons.each do |lesson|
      if lesson.has_lesson_plan
        lesson_ids << lesson.id
      end
    end
    request = {
      execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED],
      user_id: current_user.id,
      lesson_ids: lesson_ids,
      unit_id: unit_id
    }
    AiLessonSummariesJob.perform_later(request)
  end

  def perform_ai_lesson_summary_by_lesson(lesson_id)
    if lesson.has_lesson_plan
      request = {
        execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED],
        user_id: current_user.id,
        lesson_id: [lesson.id],
        unit_id: nil
      }
      AiLessonSummariesJob.perform_later(request)
    end
  end

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :user_id, :lesson_summary)
  end
end
