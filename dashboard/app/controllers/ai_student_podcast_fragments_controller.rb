class AiStudentPodcastFragmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_fragment, only: [:show, :update, :destroy]

  # GET /ai_student_podcast_fragments?lesson_id=1[&objective_id=2]
  def index
    fragments = AiStudentPodcastFragment.where(user_id: current_user.id)
    fragments = fragments.where(lesson_id: params[:lesson_id]) if params[:lesson_id]
    fragments = fragments.where(objective_id: params[:objective_id]) if params[:objective_id]
    render json: fragments
  end

  # GET /ai_student_podcast_fragments/:id
  def show
    render json: @fragment
  end

  # POST /ai_student_podcast_fragments
  def create
    fragment = AiStudentPodcastFragment.new(fragment_params)
    fragment.user_id = current_user.id
    if fragment.save
      render json: fragment, status: :created
    else
      render json: {errors: fragment.errors.full_messages}, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /ai_student_podcast_fragments/:id
  def update
    if @fragment.update(fragment_params)
      render json: @fragment
    else
      render json: {errors: @fragment.errors.full_messages}, status: :unprocessable_entity
    end
  end

  # DELETE /ai_student_podcast_fragments/:id
  def destroy
    @fragment.destroy
    head :no_content
  end

  private def set_fragment
    @fragment = AiStudentPodcastFragment.find_by(id: params[:id], user_id: current_user.id)
    render json: {error: 'Not found'}, status: :not_found unless @fragment
  end

  private def fragment_params
    params.transform_keys(&:underscore).permit(:lesson_id, :fragment_type, :objective_id, :podcast_script)
  end
end
