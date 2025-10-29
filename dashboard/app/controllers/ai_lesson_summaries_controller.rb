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

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :user_id, :lesson_summary)
  end
end
