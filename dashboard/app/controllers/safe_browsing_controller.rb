require 'cdo/safe_browsing'

class SafeBrowsingController < ApplicationController
  def safe_to_open
    result = SafeBrowsing.determine_safe_to_open(params[:url])

    render json: {approved: result}
  end
end
