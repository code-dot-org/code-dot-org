class QuizQuestionResponsesController < ApplicationController
  include QuizResponseGrading

  before_action :authenticate_user!

  # Grades server-side so the correct answer is never sent to the client.
  # TODO: support manual/AI grading.
  def create
    attempt = QuizAttempt.find(params[:quizAttemptId])
    raise ActiveRecord::RecordNotFound unless attempt.user_id == current_user.id

    # The question must be on this attempt's quiz.
    question = QuizQuestion.find(params[:quizQuestionId])
    raise ActiveRecord::RecordNotFound unless QuizQuestionPlacement.exists?(
      level_id: attempt.level_id,
      quiz_question_id: question.id
    )
    response_data = params[:responseData].is_a?(ActionController::Parameters) ? params[:responseData].permit!.to_h : {}

    response = nil
    # Locks the same quiz_attempts row QuizAttemptsController#update locks.
    attempt.with_lock do
      # Once submitted, this attempt is immutable - a retake (see
      # QuizAttempt#retakeable?) mints a new attempt row rather than reopening it.
      raise 'attempt already submitted' if attempt.submitted_at.present?
      # response_deadline_passed? adds a grace period on top of expires_at.
      raise 'time limit exceeded' if attempt.response_deadline_passed?

      response = grade_and_save_response!(attempt, question, response_data)
    end

    render status: :ok, json: {
      id: response.id,
      gradingStatus: response.grading_status
    }
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end
end
