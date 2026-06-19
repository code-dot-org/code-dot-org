class UserPracticeProblemAttemptsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # POST /user_practice_problem_attempts
  def create
    @user_practice_problem_attempt = UserPracticeProblemAttempt.create!(
      user_practice_problem_attempt_params.merge(user_id: current_user.id)
    )
    render json: @user_practice_problem_attempt.summarize, status: :created
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # GET /user_practice_problem_attempts/:id
  def show
    render json: @user_practice_problem_attempt.summarize
  end

  # GET /user_practice_problem_attempts
  def index
    attempts = @user_practice_problem_attempts
    attempts = attempts.where(practice_problem_id: params[:problem_ids]) if params[:problem_ids].present?
    render json: attempts.map(&:summarize)
  end

  # PUT /user_practice_problem_attempts/:id
  def update
    @user_practice_problem_attempt.update!(user_practice_problem_attempt_params)
    render json: @user_practice_problem_attempt.summarize
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  private def user_practice_problem_attempt_params
    params.permit(
      :practice_problem_id,
      :correct,
      :ai_feedback,
      :delivery_context_type,
      attempt: {},
      delivery_context_metadata: {}
    )
  end
end
