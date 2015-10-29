class HintViewRequestsController < ApplicationController
  def create
    status_code = :unauthorized
    if HintViewRequest.enabled? && current_user
      valid_request = HintViewRequest.create(
        script_id: params[:script_id],
        level_id: params[:level_id],
        user_id: current_user.id,
        feedback_type: params[:feedback_type],
        feedback_xml: params[:feedback_xml]
      ).valid?
      status_code = valid_request ? :created : :bad_request
    end
    head status_code
  end
end
