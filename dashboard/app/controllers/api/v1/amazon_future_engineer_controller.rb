require 'cdo/contact_rollups/v2/pardot_helpers'

class Api::V1::AmazonFutureEngineerController < ApplicationController
  include PardotHelpers

  skip_before_action :verify_authenticity_token

  def submit
    return head :forbidden unless current_user

    post_request('fake_pardot_url.com', params[:amazon_future_engineer])
  end
end
