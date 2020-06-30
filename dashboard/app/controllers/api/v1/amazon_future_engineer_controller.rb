require 'honeybadger/ruby'

#
# Handles submissions to our AFE form at code.org/afe, and in turn submits on
# teachers' behalf to that program and related programs.
#
class Api::V1::AmazonFutureEngineerController < ApplicationController
  # Necessary since Pegasus pages use this controller via dashboardapi
  skip_before_action :verify_authenticity_token

  def submit
    return head :forbidden unless current_user

    afe_params = submit_params
    Services::AFEEnrollment.new.submit(
      traffic_source: 'AFE-code.org',
      first_name: afe_params['firstName'],
      last_name: afe_params['lastName'],
      email: afe_params['email'],
      nces_id: afe_params['schoolId'],
      street_1: afe_params['street1'],
      street_2: afe_params['street2'],
      city: afe_params['city'],
      state: afe_params['state'],
      zip: afe_params['zip'],
      marketing_kit: afe_params['inspirationKit'],
      csta_plus: afe_params['csta'],
      aws_educate: afe_params['awsEducate'],
      amazon_terms: afe_params['consentAFE'],
      new_code_account: current_user.created_at > 5.minutes.ago
    )
  rescue Services::AFEEnrollment::Error => e
    Honeybadger.notify e
    head :bad_request
  end

  private

  REQUIRED_PARAMETERS = %w(
    trafficSource
    firstName
    lastName
    email
    schoolId
    inspirationKit
    csta
    awsEducate
    consentAFE
  )

  PERMITTED_PARAMETERS = [
    *REQUIRED_PARAMETERS,
    'street1',
    'street2',
    'street3',
    'city',
    'state',
    'zip'
  ]

  def submit_params
    params.require(:amazon_future_engineer).
           permit(*PERMITTED_PARAMETERS).
           tap {|p| p.require(REQUIRED_PARAMETERS)}
  end
end
