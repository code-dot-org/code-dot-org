class Pd::TeacherApplicationController < ApplicationController
  def new
    authorize! :create, Pd::TeacherApplication

    if Pd::TeacherApplication.exists?(user: current_user)
      render :submitted
    end
  end
end
