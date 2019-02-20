class SafeBrowsingController < ApplicationController
  include SafeBrowsing
  skip_before_action :verify_authenticity_token

  def safe_to_open
    result = SafeBrowsing.determine_safe_to_open(params[:url])

    render json: {approved: result}
  end
end
