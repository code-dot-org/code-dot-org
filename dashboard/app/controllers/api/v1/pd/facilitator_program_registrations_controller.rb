class Api::V1::Pd::FacilitatorProgramRegistrationsController < ApplicationController
  authorize_resource class: 'Pd::FacilitatorProgramRegistration', only: :create

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    teachercon = params.try(:[], :teachercon)

    facilitator_program_registration = ::Pd::FacilitatorProgramRegistration.new(
      user: current_user,
      teachercon: teachercon,
      form_data: form_data_json
    )

    begin
      facilitator_program_registration.save
    rescue
      # Fail silently - this happens in the event of multiple submission
      CDO.log.warn "Duplicate pd facilitator program registration submission for user #{current_user.id} - ignoring the second one"
      head :no_content
      return
    end

    if facilitator_program_registration.persisted?
      render json: {id: facilitator_program_registration.id}, status: :created
    else
      render json: {errors: facilitator_program_registration.errors.messages}, status: :bad_request
    end
  end
end
