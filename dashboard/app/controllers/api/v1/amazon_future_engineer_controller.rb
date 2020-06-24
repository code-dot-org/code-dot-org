require 'cdo/contact_rollups/v2/pardot_helpers'

class Api::V1::AmazonFutureEngineerController < ApplicationController
  include PardotHelpers

  # Necessary since Pegasus pages use this controller via dashboardapi
  skip_before_action :verify_authenticity_token

  def submit
    return head :forbidden unless current_user
    if CDO.afe_pardot_form_handler_url
      post_request CDO.afe_pardot_form_handler_url, submit_params
    else
      # Success, with a message:
      <<~RESPONSE
        It looks like you haven't configured the
        afe_pardot_form_handler_url property.
        Set this up in your locals.yml if you are testing this feature locally
        and need to check the request sent to AFE-Pardot.
      RESPONSE
    end
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
