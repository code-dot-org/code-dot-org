class Api::V1::Pd::RegionalPartnerProgramRegistrationsController < ApplicationController
  authorize_resource class: 'Pd::RegionalPartnerProgramRegistration', only: :create

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    teachercon = params.try(:[], :teachercon)

    regional_partner_program_registration = ::Pd::RegionalPartnerProgramRegistration.create(
      user: current_user,
      teachercon: teachercon,
      form_data: form_data_json
    )

    if regional_partner_program_registration.persisted?
      render json: {id: regional_partner_program_registration.id}, status: :created
    else
      render json: {errors: regional_partner_program_registration.errors.messages}, status: :bad_request
    end
  end
end
