require 'json'

class OpenaiPersonalizationController < ApplicationController
  authorize_resource class: false

  # POST /openai/match_teaching_profile
  def match_teaching_profile
    teaching_profile_data = match_teaching_profile_params[:teaching_profile_data]

    unless teaching_profile_data
      return render status: :bad_request, json: {error: "Missing teaching_profile_data"}
    end

    response = OpenaiPersonalizationHelper.match_teaching_profile(teaching_profile_data)

    return render(status: response[:status], json: response[:json])
  end

  private def match_teaching_profile_params
    params.permit(:teaching_profile_data => {})
  end
end
