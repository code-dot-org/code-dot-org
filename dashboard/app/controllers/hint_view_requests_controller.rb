class HintViewRequestsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    unless HintViewRequest.enabled? && current_user
      head :unauthorized
      return
    end

    hint_view_request = HintViewRequest.new(hint_view_request_params.merge(user_id: current_user.id))

    pairing_user_ids.each do |paired_user_id|
      # Ignore errors here.
      HintViewRequest.create(hint_view_request_params.merge(user_id: paired_user_id))
    end

    if hint_view_request.save
      head :created
    else
      head :bad_request
    end
  end

  def hint_view_request_params
    params.permit(:script_id, :level_id, :feedback_type, :feedback_xml)
  end
end
