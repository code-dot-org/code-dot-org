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

  def has_ai_tutor_access?
    return false if ai_tutor_access_denied || ai_tutor_feature_globally_disabled?
    permission_for_ai_tutor? || in_ai_tutor_experiment_with_enabled_section?
  end

  def can_enable_ai_tutor?
    !DCDO.get('ai-tutor-disabled', false) && (ai_tutor_permission? ||
      SingleUserExperiment.enabled?(user: self, experiment_name: AI_TUTOR_EXPERIMENT_NAME))
  end

  def ai_tutor_permission?
    permission?(UserPermission::AI_TUTOR_ACCESS)
  end

  def can_use_ai_iteration_tools?
    ai_tutor_permission? && levelbuilder?
  end

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

  private def ai_tutor_feature_globally_disabled?
    DCDO.get('ai-tutor-disabled', false)
  end

  private def permission_for_ai_tutor?
    permission?(UserPermission::AI_TUTOR_ACCESS)
  end

  private def in_ai_tutor_experiment_with_enabled_section?
    Queries::User::TeacherEnabledExperiments.call(self).include?(AI_TUTOR_EXPERIMENT_NAME) &&
      sections_as_student.any?(&:ai_tutor_enabled)
  end
end
