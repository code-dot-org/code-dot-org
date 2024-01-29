class AiTutorInteractionsController < ApplicationController
  # POST /ai_tutor_interactions
  def create
    puts params
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
