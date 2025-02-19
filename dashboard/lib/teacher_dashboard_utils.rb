module TeacherDashboardUtils
  # Don't redirect on levelbuilder so that builders can view extra links.
  # Redirect if the DCDO flag or experiment is enabled.
  def self.can_redirect_to_teacher_dashboard?(current_user)
    !rack_env?(:levelbuilder) &&
      (Experiment.enabled?(user: current_user, experiment_name: 'teacher-local-nav-v2') || DCDO.get('teacher-local-nav-v2', false))
  end
end
