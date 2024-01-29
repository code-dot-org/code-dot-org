class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  skip_before_action :verify_authenticity_token

  # POST /ai_tutor_interactions
  def create
    puts params
    render json: {message: "I rendered some json!"}
    # @ai_tutor_interaction = AiTutorInteraction.new(params)

    # @rubric = Rubric.new(rubric_params)
    # @lesson = @rubric.lesson
    # if @rubric.save
    #   @rubric.lesson.script.write_script_json
    #   render json: {redirectUrl: edit_rubric_path(@rubric.id), rubricId: @rubric.id}
    # else
    #   render :new
    # end
  end
end
