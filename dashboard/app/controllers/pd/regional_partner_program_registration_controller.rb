class Pd::RegionalPartnerProgramRegistrationController < ApplicationController
  def new
    authorize! :create, Pd::RegionalPartnerProgramRegistration

    begin
      @teachercon = params.require(:teachercon).to_i
    rescue ActionController::ParameterMissing
      redirect_to teachercon: 1
      return
    end

    @script_data = {
      props: {
        options: Pd::RegionalPartnerProgramRegistration.options.camelize_keys,
        requiredFields: Pd::RegionalPartnerProgramRegistration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/regional_partner_program_registrations",
        teachercon: @teachercon,
        teacherconLocation: Pd::RegionalPartnerProgramRegistration::LOCATIONS[@teachercon - 1],
        teacherconDates: Pd::RegionalPartnerProgramRegistration::DATES[@teachercon - 1]
      }.to_json
    }
  end
end
