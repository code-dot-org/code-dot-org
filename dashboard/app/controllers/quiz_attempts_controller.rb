class QuizAttemptsController < ApplicationController
  before_action :authenticate_user!

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

    render status: :created, json: {
      id: attempt.id,
      attemptNumber: attempt.attempt_number,
      submittedAt: attempt.submitted_at,
      score: attempt.score,
      maxScore: attempt.max_score
    }
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

    render status: :ok, json: {id: attempt.id, score: attempt.score, maxScore: attempt.max_score}
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end
end
