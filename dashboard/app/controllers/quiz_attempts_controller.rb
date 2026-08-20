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
    attempt = latest_attempt(params[:levelId], params[:scriptId])
    render json: attempt && quiz_attempt_json(attempt)
  end

  # Starts, resumes, or retakes this user's attempt at a quiz level within a
  # script, depending on the latest existing attempt (if any):
  #   - none yet, or the latest is submitted and Quiz#retakeable? allows
  #     another one -> create a new attempt (attempt_number + 1)
  #   - latest is still in progress, or retakes aren't allowed/exhausted ->
  #     return that same attempt unchanged
  # Reports submittedAt/score/canRetake so the frontend can restore a
  # completed quiz's result (and offer a retake, if any are left) on reload
  # instead of re-showing an editable form.
  def create
    # The level must be a Quiz, and that Quiz must actually appear in the given script.
    # Uniqueness is (user, level, script, attempt_number).
    level = Quiz.find(params[:levelId])
    script = Unit.find(params[:scriptId])
    raise ActiveRecord::RecordNotFound unless level.script_levels.exists?(script_id: script.id)

    latest = latest_attempt(level.id, script.id)
    attempt =
      if latest.nil? || latest.retakeable?
        QuizAttempt.create!(
          user: current_user,
          level: level,
          script: script,
          attempt_number: (latest&.attempt_number || 0) + 1,
          started_at: Time.now
        )
      else
        latest
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
      # Only questions on this quiz count; a response for some other
      # QuizQuestion must not inflate score/max_score.
      in_quiz_question_ids = QuizLevelQuestion.where(level_id: attempt.level_id).select(:quiz_question_id)
      auto_graded = attempt.quiz_question_responses.
        where(grading_status: 'auto_graded', quiz_question_id: in_quiz_question_ids)
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

  private def latest_attempt(level_id, script_id)
    QuizAttempt.where(user: current_user, level_id: level_id, script_id: script_id).
      order(attempt_number: :desc).first
  end

  private def quiz_attempt_json(attempt)
    {
      id: attempt.id,
      attemptNumber: attempt.attempt_number,
      submittedAt: attempt.submitted_at,
      score: attempt.score,
      maxScore: attempt.max_score,
      # nil when the quiz has no time limit - see QuizAttempt#expires_at.
      # The client computes its own countdown/auto-submit.
      expiresAt: attempt.expires_at,
      # Whether POSTing to #create again would start a new attempt rather
      # than just returning this one - see QuizAttempt#retakeable?.
      canRetake: attempt.retakeable?,
      # nil unless this attempt is submitted - always carries
      # selectedChoiceId once it does, so the client can restore/highlight
      # past answers on reload; correct/explanation are further gated by
      # the quiz's own settings - see QuizAttempt#question_results.
      questionResults: attempt.question_results&.map do |result|
        {
          quizQuestionId: result[:quiz_question_id],
          selectedChoiceId: result[:selected_choice_id],
          correct: result[:correct],
          explanation: result[:explanation],
          correctChoiceId: result[:correct_choice_id]
        }
      end
    }
  end
end
