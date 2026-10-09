class AiStudentPodcastsController < ApplicationController
  before_action :authenticate_user!

  # GET /ai_student_podcasts/show?lesson_id=1&objective_ids[]=2
  def show
    return head :forbidden unless SingleUserExperiment.enabled?(user: current_user, experiment_name: 'lesson-tutor')
    objective_ids = Array(podcast_params[:objective_ids]).map(&:to_i).sort
    podcast_data = find_user_podcast(podcast_params[:lesson_id], objective_ids)
    return head :not_found unless podcast_data
    render json: podcast_data
  end

  def retrieve_podcast_from_s3
    return head :forbidden unless SingleUserExperiment.enabled?(user: current_user, experiment_name: 'lesson-tutor')
    lesson_id = podcast_params[:lesson_id]
    objective_ids = podcast_params[:objective_ids]
    return head :not_found unless AiStudentPodcastsHelper.exists_in_s3?(lesson_id, objective_ids)
    podcast = AiStudentPodcastsHelper.retrieve_podcast_from_s3(lesson_id, objective_ids)
    send_data podcast, type: 'audio/mpeg', disposition: 'inline'
  end

  # POST /ai_student_podcasts/generate_podcast
  def generate_podcast
    return head :forbidden unless SingleUserExperiment.enabled?(user: current_user, experiment_name: 'lesson-tutor')
    lesson_id = podcast_params[:lesson_id]
    objective_ids = Array(podcast_params[:objective_ids]).map(&:to_i).sort

    # Each (user, lesson) has at most one podcast record. If the student's
    # struggling set changes, update the existing record in place rather than
    # piling up rows; if it hasn't changed, leave the record alone so the job
    # short-circuits on the cached S3 file. order(updated_at: :desc) gives a
    # deterministic pick if duplicates exist from before this rule landed.
    podcast_data = AiStudentPodcast.
      where(user_id: current_user.id, lesson_id: lesson_id).
      order(updated_at: :desc).
      first

    if podcast_data
      if podcast_data.objective_ids.map(&:to_i).sort != objective_ids
        # The objective set changed; rebuild the join rows and clear the cached
        # script so the job regenerates audio for the new key.
        podcast_data.transaction do
          podcast_data.ai_student_podcast_objectives.destroy_all
          objective_ids.each do |obj_id|
            podcast_data.ai_student_podcast_objectives.create!(objective_id: obj_id)
          end
          podcast_data.update!(podcast_script: nil)
        end
      end
    else
      podcast_data = AiStudentPodcast.create!(
        user_id: current_user.id,
        lesson_id: lesson_id,
      )
      objective_ids.each do |obj_id|
        podcast_data.ai_student_podcast_objectives.create!(objective_id: obj_id)
      end
    end

    request = {student_podcast_data: podcast_data}
    AiStudentPodcastsJob.perform_later(request: request)

    render json: podcast_data
  end

  # Finds the current user's podcast for a lesson whose objective set exactly
  # matches objective_ids. An objectiveless podcast has no join rows, so the
  # INNER JOIN aggregation can never match it; look it up by their absence.
  private def find_user_podcast(lesson_id, objective_ids)
    scope = AiStudentPodcast.where(user_id: current_user.id, lesson_id: lesson_id)
    if objective_ids.empty?
      scope.where.missing(:ai_student_podcast_objectives).first
    else
      scope.
        joins(:ai_student_podcast_objectives).
        group('ai_student_podcasts.id').
        having(
          'COUNT(ai_student_podcast_objectives.objective_id) = ? AND SUM(ai_student_podcast_objectives.objective_id IN (?)) = ?',
          objective_ids.size,
          objective_ids,
          objective_ids.size
        ).
        first
    end
  end

  private def podcast_params
    params.transform_keys(&:underscore).permit(:lesson_id, objective_ids: [])
  end
end
