class Pd::FacilitatorProgramRegistrationController < ApplicationController
  # here we handle the CanCan error manually so that we can present
  # non-authorized users with a custom page explaining that they must be logged
  # in as a facilitator account, rather than giving them the generic 404
  rescue_from CanCan::AccessDenied do
    render :unauthorized
  end

  def new
    authorize! :create, Pd::FacilitatorProgramRegistration

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
      props: {
        options: Pd::FacilitatorProgramRegistration.options.camelize_keys,
        requiredFields: Pd::FacilitatorProgramRegistration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/facilitator_program_registrations",
        attendanceDates: dates.camelize_keys,
        teachercon: @teachercon,
        course: Pd::FacilitatorProgramRegistration.course(current_user, @teachercon),
        teacherconLocation: Pd::FacilitatorProgramRegistration::LOCATIONS[@teachercon - 1]
      }.to_json
    }
  end
end
