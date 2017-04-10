class Pd::FacilitatorProgramRegistrationController < ApplicationController
  rescue_from CanCan::AccessDenied do
    render :unauthorized
  end

  def new
    session[:return_to] = pd_facilitator_program_registration_path
    authorize! :create, Pd::FacilitatorProgramRegistration
    session.delete :return_to

    begin
      @teachercon = params.require(:teachercon).to_i
    rescue ActionController::ParameterMissing
      redirect_to teachercon: 1
      return
    end

    if Pd::FacilitatorProgramRegistration.exists?(user: current_user, teachercon: @teachercon)
      @registration = Pd::FacilitatorProgramRegistration.find_by(user: current_user, teachercon: @teachercon)
      render :submitted
      return
    end

    dates = Pd::FacilitatorProgramRegistration.attendance_dates(current_user, @teachercon)
    if dates.nil?
      render :not_attending
      return
    end

    @script_data = {
      options: Pd::FacilitatorProgramRegistration::OPTIONS.camelize_keys.to_json,
      attendanceDates: dates.to_json,
      teacherconLocation: Pd::FacilitatorProgramRegistration::LOCATIONS[@teachercon - 1].to_json
    }
  end
end
