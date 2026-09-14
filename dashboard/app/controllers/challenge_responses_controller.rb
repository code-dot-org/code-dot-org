class ChallengeResponsesController < ApplicationController
  before_action :authenticate_user!
  # `create` builds the response and its nested assets by hand, so skip
  # CanCanCan's automatic resource loading for it (it would otherwise try to
  # build ChallengeResponse from `challenge_response_params`, which includes the
  # non-attribute `assets` key) and authorize the class directly instead.
  # `index` and `unit_counts` are skipped too: the :read ability is
  # block-based, which accessible_by cannot translate into a query, so those
  # actions build their own scope (see gallery_scope).
  load_and_authorize_resource except: [:create, :index, :unit_counts]
  before_action :authorize_create!, only: :create

  # GET /challenge_responses?section_id=:section_id&unit_id=:unit_id&sort=oldest
  # GET /challenge_responses?lesson_id=:lesson_id
  # GET /challenge_responses?challenge_id=:challenge_id
  # GET /challenge_responses?user_id=:user_id&challenge_id=:challenge_id
  #
  # Final submissions, newest first by default, with presigned download URLs
  # on each asset. Without section_id this is the signed-in user's own work
  # ("My Projects"), collapsed to the newest submission per challenge; with
  # section_id it is the whole class section's work (the Tutor+ gallery),
  # collapsed per student per challenge, available to the section's members
  # and instructors. With user_id it is that student's submissions (the
  # project page's version switcher), uncollapsed, listed only for the
  # student themselves and their teachers. The AI feedback stays private:
  # student_feedback is only included on the caller's own rows.
  def index
    responses = gallery_scope.
      order(created_at: params[:sort] == 'oldest' ? :asc : :desc).
      includes(:user, :challenge_response_assets, :challenge_response_reactions, challenge: :lesson)
    if params[:unit_id].present?
      # Lesson's table is legacy-named "stages", so address the column
      # through arel rather than a symbol key.
      responses = responses.joins(challenge: :lesson).where(Lesson.arel_table[:script_id].eq(params[:unit_id]))
    end
    if params[:lesson_id].present?
      responses = responses.joins(:challenge).where(challenges: {lesson_id: params[:lesson_id]})
    end
    if params[:challenge_id].present?
      responses = responses.where(challenge_id: params[:challenge_id])
    end
    render json: responses.map {|response| response.summarize(viewer: current_user, include_feedback: response.user_id == current_user.id)}
  end

  # GET /challenge_responses/unit_counts?section_id=:section_id
  #
  # Submission counts per unit, {unit_id => count}, over the same scope as
  # index. Backs the unit filter in the gallery sidebar.
  def unit_counts
    counts = gallery_scope.joins(challenge: :lesson).group(Lesson.arel_table[:script_id]).count
    render json: counts
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
  # The project page detail. What is included depends on who is looking:
  # the response's author gets their constructive feedback; the author's
  # teachers additionally get the scored rubric evaluation and the
  # challenge's rubric; section peers get the work itself only. Every
  # viewer gets the challenge question and their own viewer_role so the
  # page can pick the right layout.
  def show
    role = viewer_role
    summary = @challenge_response.summarize(
      viewer: current_user,
      include_evaluation: role == 'teacher',
      include_feedback: role != 'peer'
    )
    summary[:viewer_role] = role
    summary[:question] = @challenge_response.challenge.question
    summary[:evaluated_at] = @challenge_response.evaluated_at unless role == 'peer'
    summary[:rubric] = @challenge_response.challenge.rubric if role == 'teacher'
    render json: summary
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

  # The rows the gallery lists: one student's final submissions when
  # user_id is given, the section's when section_id is given (authorized
  # like other per-section listings, e.g. the projects gallery), otherwise
  # the caller's own.
  #
  # Both gallery views show one card per challenge — the most recent
  # submission; a resubmission replaces its predecessor. The class gallery
  # (section_id) collapses per student per challenge; "My Projects" (the
  # caller's own work) collapses per challenge. Only the per-student version
  # switcher (user_id) is left uncollapsed: it lists every submission.
  private def gallery_scope
    scope = ChallengeResponse.where(is_final: true)
    if params[:user_id].present?
      student = User.find(params[:user_id])
      authorize_student_listing! student
      return scope.where(user_id: student.id)
    end
    # Final submissions are immutable, so the max id per group is the newest.
    if params[:section_id].blank?
      own_scope = scope.where(user_id: current_user.id)
      return ChallengeResponse.where(id: own_scope.group(:challenge_id).select('MAX(id)'))
    end

    section = Section.find(params[:section_id])
    authorize! :list_projects, section
    section_scope = scope.where(user_id: section.students.select(:id))
    ChallengeResponse.where(id: section_scope.group(:challenge_id, :user_id).select('MAX(id)'))
  end

  # Who may list a student's full submission history (the project page's
  # version switcher): the student themselves and their teachers only.
  # Section peers can :read a classmate's linked submission but not page
  # through their earlier ones, so they are excluded here.
  private def authorize_student_listing!(student)
    return if student.id == current_user.id
    return if current_user.students.exists?(id: student.id)
    raise CanCan::AccessDenied.new(nil, :index, ChallengeResponse)
  end

  # 'owner', 'teacher', or 'peer' — this viewer's relationship to
  # @challenge_response, which decides what show serializes.
  private def viewer_role
    return 'owner' if @challenge_response.user_id == current_user.id
    return 'teacher' if current_user.students.exists?(id: @challenge_response.user_id)
    'peer'
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
