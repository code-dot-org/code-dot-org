class QuizQuestionResponsesController < ApplicationController
  before_action :authenticate_user!

  # Grades server-side so the correct answer is never sent to the
  # client; see QuizQuestion#auto_gradable?/#grade. Question types that
  # can't grade themselves are stored ungraded.
  # TODO: support manual/AI grading.
  def create
    attempt = QuizAttempt.find(params[:quizAttemptId])
    raise ActiveRecord::RecordNotFound unless attempt.user_id == current_user.id

    # The question must be on this attempt's quiz. Doesn't touch attempt
    # state, so no need to hold it up inside the lock below.
    question = QuizQuestion.find(params[:quizQuestionId])
    raise ActiveRecord::RecordNotFound unless QuizQuestionPlacement.exists?(
      level_id: attempt.level_id,
      quiz_question_id: question.id
    )
    response_data = params[:responseData].is_a?(ActionController::Parameters) ? params[:responseData].permit!.to_h : {}

    response = nil
    # Locks the same quiz_attempts row QuizAttemptsController#update locks
    # (see its with_lock) - without this, a response write and a concurrent
    # finalize can interleave: this action reads submitted_at as blank,
    # #update reads/sums responses/marks submitted/commits, then this
    # action's write lands after all that, adding a response to a
    # supposedly-immutable attempt that was never counted in its score.
    # with_lock reloads `attempt` under the row lock, so submitted_at below
    # reflects any commit that just happened while this was waiting.
    attempt.with_lock do
      # Once submitted, this attempt is immutable - a retake (see
      # Quiz#retakeable?) mints a new attempt row rather than reopening it.
      raise 'attempt already submitted' if attempt.submitted_at.present?
      # response_deadline_passed? adds a grace period on top of expires_at
      # to take into account network/server latency.
      raise 'time limit exceeded' if attempt.response_deadline_passed?

      if question.auto_gradable?
        grade = question.grade(response_data)
        grading_status = 'auto_graded'
      else
        grade = {score: nil, max_score: nil}
        grading_status = 'ungraded'
      end

      # A student can change their answer before final submission, so
      # resubmitting the same question updates its existing response rather
      # than colliding with the (quiz_attempt_id, quiz_question_id) unique index.
      response = QuizQuestionResponse.find_or_initialize_by(quiz_attempt: attempt, quiz_question: question)
      response.update!(
        response_data: response_data,
        score: grade[:score],
        max_score: grade[:max_score],
        grading_status: grading_status
      )
    end

    render status: :ok, json: {
      id: response.id,
      score: response.score,
      maxScore: response.max_score,
      gradingStatus: response.grading_status
    }
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end
end
