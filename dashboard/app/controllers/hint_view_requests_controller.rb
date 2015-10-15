class HintViewRequestsController < ApplicationController
  def create
    @hint_view_request = HintViewRequest.create(
      script_id: params[:script_id],
      level_id: params[:level_id],
      user_id: current_user.id,
      feedback_type: params[:feedback_type],
      feedback_xml: params[:feedback_xml]
    )
    respond_to do |format|
      format.json { head :created }
    end
  end
end
