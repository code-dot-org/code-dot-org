class NewFeatureFeedbackController < ApplicationController
  before_action :authenticate_user!

  def create
    @feedback = NewFeatureFeedback.new(feedback_params)

    @feedback.user = current_user

    respond_to do |format|
      if @feedback.save
        format.json {render json: @feedback, status: :created}
      else
        format.json {render json: @feedback.errors.full_messages, status: :unprocessable_entity}
      end
    end
  end

  def show
    @feedback = NewFeatureFeedback.find_by(user: current_user, form_key: params.require(:form_key))

    respond_to do |format|
      format.json {render json: @feedback}
    end
  end

  private def feedback_params
    params.require(:feedback).permit(:satisfied, :form_key)
  end
end
