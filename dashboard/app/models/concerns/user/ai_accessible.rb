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

  # Chat apis trust the client to decide if it can access chat features
  # This enables us to do things like turn on the tutor UI with a url param, or
  # experiment with new lab types (flow lab) with low friction.
  def trust_chat_client?(client_type)
    return true if client_type == SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]
    return true if client_type == SharedConstants::AI_CHAT_CLIENT_TYPES[:FLOW_LAB]
    false
  end

  # This should be used to inform the UI of when to set Tutor to "sleeping"
  # on a level that would otherwise show Tutor.
  def has_ai_tutor_access?
    return false if ai_tutor_access_denied || ai_tutor_feature_globally_disabled?
    teacher_in_ai_tutor_pilot? || in_ai_tutor_enabled_section_with_pilot_teacher?
  end

  def can_enable_ai_tutor?
    !ai_tutor_feature_globally_disabled? && teacher_in_ai_tutor_pilot?
  end

  def can_use_ai_iteration_tools?
    levelbuilder?
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

  def can_access_ai_tutor?(client_type)
    # If the request is coming from AiTutor or FlowLab, trust the client to decide
    # if it can access the chat backend. This allows easy testing of AiTutor using a url param.
    client_type == SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR] ||
      client_type == SharedConstants::AI_CHAT_CLIENT_TYPES[:FLOW_LAB]
  end

  private def ai_tutor_feature_globally_disabled?
    DCDO.get('ai-tutor-disabled', false)
  end

  private def in_ai_tutor_enabled_section_with_pilot_teacher?
    Queries::User::TeacherEnabledExperiments.call(self).include?(AI_TUTOR_EXPERIMENT_NAME) &&
      sections_as_student.any?(&:ai_tutor_enabled)
  end

  private def teacher_in_ai_tutor_pilot?
    teacher? && SingleUserExperiment.enabled?(user: self, experiment_name: AI_TUTOR_EXPERIMENT_NAME)
  end
end
