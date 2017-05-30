module Pd::NewAttendanceModel
  extend ActiveSupport::Concern

  EXPERIMENT_NAME = 'NewPdAttendanceModel'.freeze

  def new_attendance_model_enabled?
    # Always on for admins
    return true if current_user.permission? UserPermission::WORKSHOP_ADMIN

    # For facilitators / organizers, see if the experiment is enabled for them.
    SingleUserExperiment.get_enabled(user: current_user).where(name: EXPERIMENT_NAME).exists?
  end
end
