class Pd::TeacherApplicationController < ApplicationController
  def new
    session[:return_to] = pd_teacher_application_path
    authorize! :create, Pd::TeacherApplication

    if Pd::TeacherApplication.exists?(user: current_user)
      render :submitted
    end
  end
end
