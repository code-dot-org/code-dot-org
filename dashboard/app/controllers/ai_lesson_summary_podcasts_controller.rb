class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!

  def generate_podcast
    # Placeholder to be replaced with generated script
    script = "[energetic] You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class."

    podcast = AiLessonSummariesPodcastHelper.get_podcast_from_script(script)

    send_data podcast, :type => 'audio/mpeg', :dispensation => 'attachment', :filename => 'podcast.mp3'
  end

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
