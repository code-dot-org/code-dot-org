

require 'state_abbr'

#
# Handles submissions to our AFE form at code.org/afe, and in turn submits on
# teachers' behalf to that program and related programs.
#
class Api::V1::AmazonFutureEngineerController < ApplicationController

  def submit
    return head :forbidden unless current_user&.teacher?

    afe_params = submit_params
    # Retrieve the school to fill in address (and other) details
    school = School.find_by(id: afe_params['schoolId'])

    submission_body = Services::AFEEnrollment.submit(
      first_name: afe_params['firstName'],
      last_name: afe_params['lastName'],
      email: afe_params['email'],
      nces_id: afe_params['schoolId'],
      street_1: school&.address_line1 || '',
      street_2: school&.address_line2 || '',
      city: school&.city || '',
      state: school&.state || '',
      zip: school&.zip || '',
      marketing_kit: afe_params['inspirationKit'],
      csta_plus: afe_params['csta'],
      amazon_terms: afe_params['consentAFE'],
      new_code_account: current_user.created_at > 5.minutes.ago
    )

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'amazon-future-engineer-eligibility',
        event: 'submit_to_afe',
        data_json: {
          accountEmail: current_user.email,
          accountSchoolId: current_user&.school_info&.school&.id,
          formEmail: afe_params['email'],
          formSchoolId: afe_params['schoolId'],
          formData: submission_body
        }.to_json
      }
    )

    # If the teacher requested it, submit to CSTA as well
    if to_bool(afe_params['csta'])
      school_district = school&.school_district

      Services::CSTAEnrollment.submit(
        first_name: afe_params['firstName'],
        last_name: afe_params['lastName'],
        email: afe_params['email'],
        school_district_name: school_district&.name || '',
        school_name: school&.name || '',
        street_1: school&.address_line1 || '',
        street_2: school&.address_line2 || '',
        city: school&.city || '',
        state: school&.state || '',
        zip: school&.zip || '',
        professional_role: afe_params['primaryProfessionalRole'] || '',
        grades_teaching: afe_params['gradesTeaching'] || '',
        privacy_permission: to_bool(afe_params['consentCSTA'])
      )
    end
  rescue Services::AFEEnrollment::Error, Services::CSTAEnrollment::Error => exception
    Harness.error_notify exception
    render json: exception.to_s, status: :bad_request
  end

  REQUIRED_PARAMETERS = %w(
    firstName
    lastName
    email
    schoolId
    inspirationKit
    csta
    consentAFE
  )

  PERMITTED_PARAMETERS = [
    *REQUIRED_PARAMETERS,
    'primaryProfessionalRole',
    'gradesTeaching',
    'consentCSTA'
  ]

  private def submit_params
    params.require(:amazon_future_engineer).
      permit(*PERMITTED_PARAMETERS).
      tap {|p| p.require(REQUIRED_PARAMETERS)}
  end

  private def to_bool(val)
    ActiveModel::Type::Boolean.new.cast val
  end
end
