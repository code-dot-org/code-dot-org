# Adds methods for determining and enforcing AI access rules.
# Relies on these serialized attributes:
# - ai_tutor_access_denied
# - ai_rubrics_disabled
# - ai_rubrics_tour_seen
# - ai_differentiation_toggled_off
# - has_completed_ai_differentiation_welcome
module User::AiAccessible
  extend ActiveSupport::Concern

  AI_TUTOR_EXPERIMENT_NAME = 'ai-tutor'

  # TODO-AITUTOR: It looks like the only utility UserPermission::AI_TUTOR_ACCESS
  # gives us at the moment is the ability for teachers to use AI Tutor on a level
  # without impersonating a student. We could let teachers
  # in the pilot use AI Tutor without a separate user permission.
  def has_ai_tutor_access?
    return false if ai_tutor_access_denied || ai_tutor_feature_globally_disabled?
    permission?(UserPermission::AI_TUTOR_ACCESS) || in_ai_tutor_experiment_with_enabled_section?
  end

  # TODO-AITUTOR: Decide if we need a different experiment
  def can_enable_ai_tutor?
    !ai_tutor_feature_globally_disabled? && (permission?(UserPermission::AI_TUTOR_ACCESS) ||
      SingleUserExperiment.enabled?(user: self, experiment_name: AI_TUTOR_EXPERIMENT_NAME))
  end

  def can_use_ai_iteration_tools?
    permission?(UserPermission::AI_TUTOR_ACCESS) && levelbuilder?
  end

  # TODO-AITUTOR: Remove this method when cleaning up tutor code.
  def can_view_student_ai_chat_messages?
    ai_tutor_courses = ['programming-fundamentals-aitutor-2024']
    (sections.any?(&:assigned_csa?) || sections.any? {|s| ai_tutor_courses.include?(s.unit_group&.name)}) &&
      SingleUserExperiment.enabled?(user: self, experiment_name: AI_TUTOR_EXPERIMENT_NAME)
  end

  def teacher_can_access_ai_chat?
    teacher? && (verified_instructor? || oauth? || Policies::Lti.lti?(self))
  end

  def student_can_access_ai_chat?
    teachers.any?(&:teacher_can_access_ai_chat?) &&
      sections_as_student.any?(&:assigned_ai_chat?)
  end

  def has_aichat_access?
    teacher_can_access_ai_chat? || student_can_access_ai_chat?
  end

  def can_access_ai_tutor2?(level_id)
    # If the request is coming from a python lab level, trust the client to decide
    # if it can access AiTutor2. This allows easy testing of AiTutor2 using a url param.
    return false if level_id.nil?
    Level.find(level_id).is_a? Pythonlab
  end

  private def ai_tutor_feature_globally_disabled?
    DCDO.get('ai-tutor-disabled', false)
  end

  private def in_ai_tutor_experiment_with_enabled_section?
    Queries::User::TeacherEnabledExperiments.call(self).include?(AI_TUTOR_EXPERIMENT_NAME) &&
      sections_as_student.any?(&:ai_tutor_enabled)
  end
end
