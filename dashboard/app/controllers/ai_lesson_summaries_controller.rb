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

  # GET /ai_lesson_summaries/ai_lesson_summary_podcast_script?lesson_id=2
  def ai_lesson_summary_podcast_script
    podcast_script_json = AiLessonSummariesHelper.get_ai_lesson_summary(params[:lesson_id], current_user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])

    if podcast_script_json
      begin
        pre_processed_script = JSON.parse(podcast_script_json[:json])['podcast_script']
        processed_podcast_script = clean_up_podcast_script_response(pre_processed_script)
        render json: {podcast_script: processed_podcast_script}
      rescue => exception
        render json: {error: "Error parsing podcast script response: #{exception}"}, status: :internal_server_error
      end
    else
      render json: {error: 'Failure to generate transcript'}, status: :internal_server_error
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
      lesson_ids: lesson_ids
    }
    AiLessonSummariesJob.perform_later(request: request)
  end

  def perform_ai_lesson_summary_by_lesson
    lesson = Lesson.find(params[:lesson_id])
    if lesson.has_lesson_plan
      request = {
        user_id: current_user.id,
        lesson_ids: [lesson.id]
      }
      AiLessonSummariesJob.perform_later(request: request)
    end
  end

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end

  private def clean_up_podcast_script_response(podcast_script_response)
    replaced_newlines = podcast_script_response.gsub("\n\n", " ")
    replaced_newlines.gsub(/\"|\’/, "'").squish
  end
end
