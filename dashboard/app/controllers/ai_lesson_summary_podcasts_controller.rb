class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!

  def generate_podcast
    if SingleUserExperiment.enabled?(user: self, experiment_name: 'ai_lesson_summaries') || DCDO.get('show-aita-lesson-summaries', false)
      # Placeholder to be replaced with generated script
      script = "[energetic] You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class."

      podcast = AiLessonSummariesPodcastHelper.get_podcast_from_script(script)

      send_data podcast, :type => 'audio/mpeg', :dispensation => 'attachment', :filename => 'podcast.mp3'
    else
      head :forbidden
    end
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
