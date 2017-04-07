class Api::V1::Pd::FacilitatorProgramRegistrationsController < ApplicationController
  authorize_resource class: 'Pd::FacilitatorProgramRegistration', only: :create

  def index
    # Require admin or a matching secret_key param
    unless current_user.try(:admin?)
      secret_key = CDO.pd_facilitator_program_registration_list_secret_key
      unless secret_key && secret_key == params[:secret_key]
        render_404
        return
      end
    end

    @facilitator_program_registrations = ::Pd::FacilitatorProgramRegistration
    if params[:after_id]
      @facilitator_program_registrations = @facilitator_program_registrations.where('id > ?', params[:after_id])
    end

    render json: @facilitator_program_registrations.all.map(&:to_expanded_json)
  end

  def create
    form_data_hash = params.require(:form_data)
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    facilitator_program_registration = ::Pd::FacilitatorProgramRegistration.new(
      user: current_user,
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
