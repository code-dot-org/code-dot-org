class QuizQuestionResponsesController < ApplicationController
  before_action :authenticate_user!

  # POC: grades server-side so the correct answer is never sent to the
  # client; see QuizQuestion#auto_gradable?/#grade. Question types that
  # can't grade themselves are stored ungraded - manual/AI grading is a
  # later milestone.
  def create
    attempt = QuizAttempt.find(params[:quizAttemptId])
    raise ActiveRecord::RecordNotFound unless attempt.user_id == current_user.id
    # P0 allows only one attempt, so a submitted attempt is immutable. This
    # is the only write-lock on responses - deliberately NOT also rejecting
    # writes once attempt.expired?, even though that sounds like the
    # obvious enforcement point: the client's auto-submit (see Quiz.tsx)
    # POSTs its last answers exactly when the deadline passes, so by the
    # time those requests arrive, expired? is already true too - rejecting
    # on expiry would reject auto-submit's own final save, not just a
    # student trying to sneak in late changes. submitted_at is the actual
    # lock; time_limit_minutes is enforced by the client choosing to
    # auto-submit, not by the server refusing writes.
    raise 'attempt already submitted' if attempt.submitted_at.present?

    question = QuizQuestion.find(params[:quizQuestionId])
    response_data = params[:responseData].is_a?(ActionController::Parameters) ? params[:responseData].permit!.to_h : {}

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
