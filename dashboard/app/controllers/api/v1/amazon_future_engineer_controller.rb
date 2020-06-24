require 'cdo/contact_rollups/v2/pardot_helpers'

class Api::V1::AmazonFutureEngineerController < ApplicationController
  include PardotHelpers

  skip_before_action :verify_authenticity_token

  def submit
    return head :forbidden unless current_user
    post_request('fake_pardot_url.com', submit_params)
  end

  private

  REQUIRED_PARAMETERS = %w(
    traffic-source
    first-name
    last-name
    email
    nces-id
    street-1
    city
    state
    zip
    inspirational-marketing-kit
    csta-plus
    aws-educate
    amazon-terms
    new-code-account
    registration-date-time
  )

  PERMITTED_PARAMETERS = [
    *REQUIRED_PARAMETERS,
    'street-2',
    'street-3'
  ]

  def submit_params
    params.require(:amazon_future_engineer).
           permit(*PERMITTED_PARAMETERS).
           tap {|p| p.require(REQUIRED_PARAMETERS)}
  end
end
