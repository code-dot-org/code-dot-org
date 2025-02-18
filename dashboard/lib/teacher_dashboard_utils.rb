module TeacherDashboardUtils
  def self.can_redirect_to_teacher_dashboard?
    !rack_env?(:levelbuilder) &&
      (Experiment.enabled?(user: current_user, experiment_name: 'teacher-local-nav-v2') || DCDO.get('teacher-local-nav-v2', false))
  end
end
