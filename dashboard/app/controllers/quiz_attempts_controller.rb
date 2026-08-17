class QuizAttemptsController < ApplicationController
  before_action :authenticate_user!

  # GET /quiz_attempts?levelId=&scriptId=
  #
  # Read-only check for an existing attempt - unlike #create, this never
  # creates one. Quiz.tsx needs this to decide whether to show the intro
  # screen (no attempt yet) or resume/show results (one already exists)
  # without the side effect of stamping started_at just from loading the
  # page - that timestamp should reflect clicking "Begin Quiz", not
  # whenever the intro screen happened to render.
  def index
    attempt = QuizAttempt.find_by(
      user: current_user,
      level_id: params[:levelId],
      script_id: params[:scriptId],
      attempt_number: 1
    )
    render json: attempt && quiz_attempt_json(attempt)
  end

  # POC: starts (or resumes) this user's one and only attempt at a quiz
  # level within a script. P0 allows exactly one attempt - multiple
  # attempts are a later milestone - so attempt_number is always 1 and
  # find_or_create_by! always returns that same row rather than a new one.
  # Reports submittedAt/score so the frontend can restore a completed
  # quiz's result on reload instead of re-showing an editable form.
  def create
    level = Level.find(params[:levelId])
    attempt = QuizAttempt.find_or_create_by!(
      user: current_user,
      level: level,
      script_id: params[:scriptId],
      attempt_number: 1
    ) do |a|
      a.started_at = Time.now
    end

    render status: :created, json: quiz_attempt_json(attempt)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # POC: finalizes the attempt - one submit for the whole quiz, not per
  # question. score/max_score only sum auto-graded responses; ungraded
  # responses (e.g. free response) don't count until manual/AI grading
  # exists. Since P0 allows only one attempt, an already-submitted attempt
  # is immutable - this returns its existing result rather than re-scoring.
  def update
    attempt = QuizAttempt.find(params[:id])
    raise ActiveRecord::RecordNotFound unless attempt.user_id == current_user.id

    if attempt.submitted_at.nil?
      auto_graded = attempt.quiz_question_responses.where(grading_status: 'auto_graded')
      attempt.update!(
        submitted_at: Time.now,
        score: auto_graded.sum(:score),
        max_score: auto_graded.sum(:max_score)
      )
    end

    render status: :ok, json: quiz_attempt_json(attempt)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  private def quiz_attempt_json(attempt)
    {
      id: attempt.id,
      attemptNumber: attempt.attempt_number,
      submittedAt: attempt.submitted_at,
      score: attempt.score,
      maxScore: attempt.max_score,
      # nil when the quiz has no time limit - see QuizAttempt#expires_at.
      # The client computes its own countdown/auto-submit from this rather
      # than us pushing a "time's up" event, so clock skew between client
      # and server just means the countdown's last second or two may be
      # slightly off, not that auto-submit fires at the wrong wall-clock
      # time (that's enforced server-side regardless, see
      # QuizQuestionResponsesController#create).
      expiresAt: attempt.expires_at
    }
  end
end
