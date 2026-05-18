class AiStudentPodcastsController < ApplicationController
  before_action :authenticate_user!

  # GET /ai_student_podcasts/:id
  def show
    podcast_data = AiStudentPodcast.find_by(id: params[:id], user_id: current_user.id)
    return head :not_found unless podcast_data
    render json: podcast_data
  end

  # POST /ai_student_podcasts/generate_podcast
  def generate_podcast
    lesson_id = podcast_params[:lesson_id]
    objective_ids = Array(podcast_params[:objective_ids]).map(&:to_i).sort

    podcast_data = AiStudentPodcast.
      joins(:ai_student_podcast_objectives).
      where(user_id: current_user.id, lesson_id: lesson_id).
      group('ai_student_podcasts.id').
      having(
        'COUNT(ai_student_podcast_objectives.objective_id) = ? AND SUM(ai_student_podcast_objectives.objective_id IN (?)) = ?',
        objective_ids.size,
        objective_ids,
        objective_ids.size
      ).
      first

    unless podcast_data
      podcast_data = AiStudentPodcast.create!(
        user_id: current_user.id,
        lesson_id: lesson_id,
      )
      objective_ids.each do |obj_id|
        podcast_data.ai_student_podcast_objectives.
          create!(objective_id: obj_id)
      end
    end

    request = {student_podcast_data: podcast_data}
    AiStudentPodcastsJob.perform_later(request: request)

    render json: podcast_data
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, objective_ids: [])
  end
end
