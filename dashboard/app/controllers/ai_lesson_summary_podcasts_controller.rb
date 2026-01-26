class AiLessonSummaryPodcastsController < ApplicationController
  before_action :authenticate_user!

  def generate_podcast
    if current_user && (SingleUserExperiment.enabled?(user: current_user, experiment_name: 'ai_lesson_summaries') || DCDO.get('show-aita-lesson-summaries', false))

      script = AiLessonSummariesHelper.generate_lesson_summary(params[:lesson_id], current_user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])[:json]
      script = JSON.parse(script)['podcast_script']
      podcast = AiLessonSummaryPodcastsHelper.get_podcast_from_script(script)

      send_data podcast, :type => 'audio/mpeg', :dispensation => 'attachment', :filename => 'podcast.mp3'
    else
      head :forbidden
    end
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, :unit_id, :lesson_summary)
  end
end
