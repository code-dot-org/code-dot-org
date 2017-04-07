class Pd::FacilitatorProgramRegistrationController < ApplicationController
  rescue_from CanCan::AccessDenied do
    render :unauthorized
  end

  def new
    session[:return_to] = pd_facilitator_program_registration_path
    authorize! :create, Pd::FacilitatorProgramRegistration
    session.delete :return_to

    if Pd::FacilitatorProgramRegistration.exists?(user: current_user)
      @registration = Pd::FacilitatorProgramRegistration.find_by(user: current_user)
      render :submitted
    end
  end
end
