require 'cdo/contact_rollups/v2/pardot_helpers'

class Api::V1::AmazonFutureEngineerController < ApplicationController
  include PardotHelpers

  # Necessary since Pegasus pages use this controller via dashboardapi
  skip_before_action :verify_authenticity_token

  def submit
    return head :forbidden unless current_user
    if CDO.afe_pardot_form_handler_url
      post_request CDO.afe_pardot_form_handler_url, afe_params
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
    trafficSource
    firstName
    lastName
    email
    schoolId
    street1
    city
    state
    zip
    inspirationKit
    csta
    awsEducate
    consentAFE
    newCodeAccount
  )

  PERMITTED_PARAMETERS = [
    *REQUIRED_PARAMETERS,
    'street2',
    'street3'
  ]

  def submit_params
    params.require(:amazon_future_engineer).
           permit(*PERMITTED_PARAMETERS).
           tap {|p| p.require(REQUIRED_PARAMETERS)}
  end

  def afe_params
    filtered_params = submit_params
    {
      'traffic-source' => filtered_params['trafficSource'],
      'first-name' => filtered_params['firstName'],
      'last-name' => filtered_params['lastName'],
      'email' => filtered_params['email'],
      'nces-id' => filtered_params['schoolId'],
      'street-1' => filtered_params['street1'],
      'street-2' => filtered_params['street2'],
      'city' => filtered_params['city'],
      'state' => filtered_params['state'],
      'zip' => filtered_params['zip'],
      'inspirational-marketing-kit' => filtered_params['inspirationKit'],
      'csta-plus' => filtered_params['csta'],
      'aws-educate' => filtered_params['awsEducate'],
      'amazon-terms' => filtered_params['consentAFE'],
      'new-code-account' => filtered_params['newCodeAccount'],
      'registration-date-time' => Time.now.iso8601
    }
  end
end
