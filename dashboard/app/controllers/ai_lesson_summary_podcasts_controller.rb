class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!
  PODCAST_BUCKET = 'org.code.autoscale-prod-studio.user-content'
  PODCAST_FOLDER = 'podcasts/'

  def show
    podcast = AWS::S3.download_from_bucket(PODCAST_BUCKET, PODCAST_FOLDER+'lesson_'+params[:lesson_id].to_s+'_podcast.mp3')
    send_data podcast, type: 'audio/mpeg', disposition: 'inline'
  end

  def generate_podcasts_by_unit
    if current_user
      unit = Unit.find(params[:unit_id])

      # AI Podcasts are currently only available in AIF sections
      if unit.curriculum_umbrella == 'AIF'
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
        AiLessonSummaryPodcastsJob.perform_later(request: request)
      else
        head :forbidden
      end
    else
      head :forbidden
    end
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
