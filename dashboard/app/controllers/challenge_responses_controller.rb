class ChallengeResponsesController < ApplicationController
  before_action :authenticate_user!
  # `create` builds the response and its nested assets by hand, so skip
  # CanCanCan's automatic resource loading for it (it would otherwise try to
  # build ChallengeResponse from `challenge_response_params`, which includes the
  # non-attribute `assets` key) and authorize the class directly instead.
  # `index` is skipped too: the :read ability is block-based, which
  # accessible_by cannot translate into a query, so index scopes to the
  # current user by hand.
  load_and_authorize_resource except: [:create, :index]
  before_action :authorize_create!, only: :create

  # GET /challenge_responses?lesson_id=:lesson_id
  # GET /challenge_responses?challenge_id=:challenge_id
  #
  # The signed-in user's own final submissions, newest first, with presigned
  # download URLs on each asset. This backs the student's gallery of completed
  # challenge work; teachers view an individual student response via `show`.
  def index
    responses = ChallengeResponse.
      where(user_id: current_user.id, is_final: true).
      order(created_at: :desc).
      includes(:challenge_response_assets)
    if params[:lesson_id].present?
      responses = responses.joins(:challenge).where(challenges: {lesson_id: params[:lesson_id]})
    end
    if params[:challenge_id].present?
      responses = responses.where(challenge_id: params[:challenge_id])
    end
    render json: responses.map(&:summarize)
  end

  # POST /challenge_responses
  #
  # Atomically creates a response and one asset row per requested asset_type,
  # then returns presigned S3 upload URLs the client PUTs the asset bytes to.
  def create
    permitted = challenge_response_params
    asset_params = permitted.delete(:assets) || []
    @challenge_response = ChallengeResponse.new(permitted.merge(user_id: current_user.id))
    asset_params.each do |asset|
      @challenge_response.challenge_response_assets.build(asset_type: asset[:asset_type])
    end
    @challenge_response.save!
    render json: @challenge_response.summarize(assets_for_upload: true), status: :created
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # GET /challenge_responses/:id
  #
  # The scored rubric evaluation is teacher-only, so it is included just for
  # non-owner readers (the student's teachers, per the :read ability).
  # Students always get their constructive feedback via student_feedback.
  def show
    include_evaluation = @challenge_response.user_id != current_user.id
    render json: @challenge_response.summarize(include_evaluation: include_evaluation)
  end

  # POST /challenge_responses/:id/evaluate
  #
  # Enqueues asynchronous AI evaluation of this response. Fire-and-forget
  # from the client's perspective: the result is stored server-side for
  # later viewing (teacher review, student feedback gallery), so a 202 is
  # all the client needs. A failed evaluation may be requested again;
  # queued/running/finished ones may not.
  def evaluate
    if @challenge_response.challenge.rubric.blank?
      return render status: :unprocessable_entity, json: {error: 'Challenge has no rubric'}
    end
    unless @challenge_response.ready_for_evaluation?
      return render status: :unprocessable_entity, json: {error: 'Response is not a final submission with all assets uploaded'}
    end
    if @challenge_response.evaluation_status.present? && !@challenge_response.evaluation_failure?
      return render status: :conflict, json: {error: 'Evaluation already requested'}
    end
    EvaluateChallengeResponseJob.perform_later(challenge_response_id: @challenge_response.id)
    render json: @challenge_response.summarize, status: :accepted
  end

  private def authorize_create!
    authorize! :create, ChallengeResponse
  end

  # Server-owned fields (student_feedback, evaluation_result,
  # evaluated_at) are intentionally not permitted.
  private def challenge_response_params
    params.permit(:challenge_id, :student_text, :transcript, :is_final, assets: [:asset_type])
  end
end
