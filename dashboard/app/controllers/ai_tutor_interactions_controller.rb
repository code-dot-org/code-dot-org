class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  skip_before_action :verify_authenticity_token

  # POST /ai_tutor_interactions
  def create
    puts params
    render json: {message: "I rendered some json!"}
    # @ai_tutor_interaction = AiTutorInteraction.new(params)
  end
end
