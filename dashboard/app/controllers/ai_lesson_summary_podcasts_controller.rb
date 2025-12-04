class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!

  def generate_podcast
    if current_user && (SingleUserExperiment.enabled?(user: current_user, experiment_name: 'ai_lesson_summaries') || DCDO.get('show-aita-lesson-summaries', false))
      # Placeholder to be replaced with generated script
      script = AiLessonSummariesHelper.get_ai_lesson_summary(params[:lesson_id], current_user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])[:json]
      puts script[:podcast_script]
      #podcast = AiLessonSummariesPodcastHelper.get_podcast_from_script(script['podcast_script'])

      #send_data podcast, :type => 'audio/mpeg', :dispensation => 'attachment', :filename => 'podcast.mp3'
    else
      head :forbidden
    end
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
