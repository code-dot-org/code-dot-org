class Pd::RegionalPartnerProgramRegistrationController < ApplicationController
  def new
    session[:return_to] = pd_regional_partner_program_registration_path
    authorize! :create, Pd::RegionalPartnerProgramRegistration
    session.delete :return_to

    begin
      @teachercon = params.require(:teachercon).to_i
    rescue ActionController::ParameterMissing
      redirect_to teachercon: 1
      return
    end

    @script_data = {
      options: Pd::RegionalPartnerProgramRegistration.options.camelize_keys.to_json,
      teachercon: @teachercon,
      teacherconLocation: Pd::RegionalPartnerProgramRegistration::LOCATIONS[@teachercon - 1].to_json,
      teacherconDates: Pd::RegionalPartnerProgramRegistration::DATES[@teachercon - 1].to_json
    }
  end
end
