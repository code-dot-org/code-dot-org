class QuizResponsesController < ApplicationController
  before_action :authenticate_user!

  # POST /levels/:level_id/quiz_responses
  def create
    quiz_response = QuizResponse.new(
      level_id: params[:level_id],
      user: current_user,
      script_id: quiz_response_params[:script_id],
      response_data: quiz_response_params[:response_data],
      submitted_at: Time.now,
    )
    if quiz_response.save
      render status: :created, json: {id: quiz_response.id}
    else
      render status: :unprocessable_entity, json: {errors: quiz_response.errors.full_messages}
    end
  end

  private def quiz_response_params
    params.permit(:script_id, response_data: {})
  end
end
