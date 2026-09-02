class QuizAttemptsController < ApplicationController
  include QuizResponseGrading

  before_action :authenticate_user!

  # GET /quiz_attempts?levelId=&unitId=&userId=
  #
  # Read-only check for an existing attempt.
  def index
    viewed_user = current_user
    if params[:userId].present?
      viewed_user = User.find(params[:userId])
      authorize! :view_quiz_attempts, viewed_user
    end
    attempt = latest_attempt(params[:levelId], params[:unitId], viewed_user)
    render json: attempt && quiz_attempt_json(attempt)
  rescue ActiveRecord::RecordNotFound
    render json: nil
  end

  # Starts, resumes, or retakes this user's attempt at a quiz level within a
  # unit, depending on the latest existing attempt (if any).
  def create
    # Uniqueness is (user, level, unit, attempt_number).
    level = Quiz.find(params[:levelId])
    unit = Unit.find(params[:unitId])
    raise ActiveRecord::RecordNotFound unless level.script_levels.exists?(script_id: unit.id)

    # Unique index is the integrity guarantee; retry so a concurrent create
    # resumes the "winner"'s row instead of 400ing.
    attempt = nil
    created = false
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      latest = latest_attempt(level.id, unit.id)
      if latest.nil? || latest.retakeable?
        attempt = QuizAttempt.create!(
          user: current_user,
          level: level,
          unit: unit,
          attempt_number: (latest&.attempt_number || 0) + 1,
          started_at: Time.now
        )
        created = true
      else
        attempt = latest
        created = false
      end
    end

    render status: created ? :created : :ok, json: quiz_attempt_json(attempt)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # P0: finalizes the attempt - one submit for the whole quiz, not per
  # question. score/max_score only sum auto-graded responses.
  def update
    attempt = QuizAttempt.find(params[:id])
    raise ActiveRecord::RecordNotFound unless attempt.user_id == current_user.id

    # Locks the same quiz_attempts row QuizQuestionResponsesController#create locks.
    attempt.with_lock do
      if attempt.submitted_at.nil?
        # Only questions on this quiz count.
        in_quiz_question_ids = QuizQuestionPlacement.where(level_id: attempt.level_id).pluck(:quiz_question_id)
        answered_ids = attempt.quiz_question_responses.where(quiz_question_id: in_quiz_question_ids).pluck(:quiz_question_id)
        # Materialize skipped responses for unanswered questions.
        QuizQuestion.where(id: in_quiz_question_ids - answered_ids).find_each do |question|
          grade_and_save_response!(attempt, question, {})
        end

        auto_graded = attempt.quiz_question_responses.
          where(grading_status: 'auto_graded', quiz_question_id: in_quiz_question_ids)
        attempt.update!(
          submitted_at: Time.now,
          score: auto_graded.sum(:score),
          max_score: auto_graded.sum(:max_score)
        )
      end
    end

    render status: :ok, json: quiz_attempt_json(attempt)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  private def latest_attempt(level_id, unit_id, user = current_user)
    QuizAttempt.where(user: user, level_id: level_id, unit_id: unit_id).
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
      expiresAt: attempt.expires_at,
      # Whether POSTing to #create again would start a new attempt rather
      # than just returning this one.
      canRetake: attempt.retakeable?,
      # nil unless this attempt is submitted.
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
