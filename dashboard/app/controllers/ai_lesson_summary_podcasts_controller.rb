class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!
  PODCAST_BUCKET = 'org.code.autoscale-prod-studio.user-content'
  PODCAST_FOLDER = 'podcasts/'

  def show
    podcast_filename = PODCAST_FOLDER + 'lesson_' + params[:lesson_id].to_s + '_podcast.mp3'
    unless AWS::S3.exists_in_bucket(PODCAST_BUCKET, podcast_filename)
      return head :not_found
    end
    podcast = AWS::S3.download_from_bucket(PODCAST_BUCKET, podcast_filename)
    send_data podcast, type: 'audio/mpeg', disposition: 'inline'
  end

  def generate_podcasts_by_unit
    return head :forbidden unless DCDO.get('ai-lesson-summary-podcasts', false)

    unit = Unit.find_by(id: podcast_params[:unit_id])
    return head :not_found unless unit

    # AI Podcasts are currently only available in AIF sections
    return head :forbidden unless unit.foundations_of_cs?

    lesson_ids = unit.lessons.select(&:has_lesson_plan).map(&:id)
    request = {
      user_id: current_user.id,
      lesson_ids: lesson_ids,
      unit_id: unit.id
    }
    AiLessonSummaryPodcastsJob.perform_later(request: request)
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
