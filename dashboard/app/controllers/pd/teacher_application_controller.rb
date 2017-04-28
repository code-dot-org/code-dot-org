class Pd::TeacherApplicationController < ApplicationController
  def new
    session[:return_to] = pd_teacher_application_path
    authorize! :create, Pd::TeacherApplication
    session.delete :return_to

    @application_data = {
      accountEmail: current_user.email,
      hashedAccountEmail: current_user.hashed_email
    }

    if Pd::TeacherApplication.exists?(user: current_user)
      render :submitted
    end
  end
end
