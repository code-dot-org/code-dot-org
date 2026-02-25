# Adds methods for determining and enforcing AI access rules.
# Relies on these serialized attributes:
# - ai_tutor_access_denied
# - ai_rubrics_disabled
# - ai_rubrics_tour_seen
# - ai_differentiation_toggled_off
# - has_completed_ai_differentiation_welcome
module User::AiAccessible
  extend ActiveSupport::Concern
  include SharedConstants

  def ai_tutor_feature_globally_disabled?
    DCDO.get('ai-tutor-disabled', false)
  end

  # Chat apis trust the client to decide if it can access chat features
  # This allows us the flexibility to do things like turn on the new UI
  # with a url param, or experiment with new lab types with low friction.
  def trust_chat_client?(client_type)
    return true if client_type == AI_CHAT_CLIENT_TYPES[:FLOW_LAB]
    false
  end

  def can_access_ai_tutor?
    return false if ai_tutor_feature_globally_disabled?
    ai_chat_access_level != AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end

  def can_use_ai_iteration_tools?
    levelbuilder?
  end

  def teacher_can_access_ai_chat_lab?
    teacher? && (verified_instructor? || oauth? || Policies::Lti.lti?(self))
  end

  def student_can_access_ai_chat_lab?
    teachers.any?(&:teacher_can_access_ai_chat_lab?) &&
      ai_chat_access_level != AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end

  def has_aichat_lab_access?
    teacher_can_access_ai_chat_lab? || student_can_access_ai_chat_lab?
  end

  def ai_chat_access_level
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if teacher?
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if in_section_with_ai_chat_access_enabled?
    return AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY] if in_section_with_ai_chat_access_essential_only?
    return AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end

  private def in_section_with_ai_chat_access_enabled?
    sections_as_student.any? {|s| s.ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED]}
  end

  private def in_section_with_ai_chat_access_essential_only?
    sections_as_student.any? {|s| s.ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY]}
  end
end
