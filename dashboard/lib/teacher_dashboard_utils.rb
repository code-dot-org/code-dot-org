module TeacherDashboardUtils
  # Don't redirect on levelbuilder so that builders can view extra links.
  # Redirect if the DCDO flag or experiment is enabled.
  def self.can_redirect_to_teacher_dashboard?(current_user)
    !rack_env?(:levelbuilder)
  end
end
