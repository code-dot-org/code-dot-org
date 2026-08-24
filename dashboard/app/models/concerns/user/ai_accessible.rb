# Adds methods for determining and enforcing AI access rules.
module User::AiAccessible
  extend ActiveSupport::Concern
  include SharedConstants

  TEACHER_PREVERIFICATION_PILOT = 'teacher-preverification'.freeze

  # Chat apis trust the client to decide if it can access chat features
  # This allows us the flexibility to do things like experiment with new
  # lab types with low friction.
  def trust_chat_client?(client_type)
    return true if client_type == AI_CHAT_CLIENT_TYPES[:FLOW_LAB]
    return true if client_type == AI_CHAT_CLIENT_TYPES[:LESSON_DEEP_DIVE]
    false
  end

  def can_use_ai_iteration_tools?
    levelbuilder?
  end

  def teacher_can_access_aichat?
    teacher? && (verified_instructor? || oauth? || Policies::Lti.lti?(self) || SingleUserExperiment.enabled?(user: self, experiment_name: TEACHER_PREVERIFICATION_PILOT))
  end

  def ai_chat_access_level
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if teacher_can_access_aichat? || levelbuilder?
    section_enabled_access_level
  end

  def blocked_aichat_model_ids
    return [] if levelbuilder?
    international_ai_chat_user? ? AI_CHAT_US_ONLY_MODEL_IDS : []
  end

  def can_use_aichat_model?(model_id)
    blocked_aichat_model_ids.exclude?(model_id)
  end

  # has essential or higher access to AI chat tools
  def has_essential_aichat_access?
    ai_chat_access_level != AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end

  def has_aichat_access?(level_id)
    access_level = ai_chat_access_level
    return true if access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED]
    return aichat_essential_for_level?(level_id) if access_level == AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY]
    false
  end

  def can_access_aichat_chat_completion?(client_type, level_id)
    return false if client_type == AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB] && DCDO.get("block_aichat_lab_chat_completion", false)
    return false if client_type == AI_CHAT_CLIENT_TYPES[:AI_TUTOR] && DCDO.get("block_ai_tutor_chat_completion", false)

    has_aichat_access?(level_id) || trust_chat_client?(client_type)
  end

  private def aichat_essential_for_level?(level_id)
    return false unless level_id
    Level.where(id: level_id).with_essential_ai_chat_tools.exists?
  end

  private def section_enabled_access_level
    return AI_CHAT_ACCESS_LEVELS[:DISABLED] unless teachers.any?(&:teacher_can_access_aichat?)
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if in_section_with_ai_chat_access_enabled?
    return AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY] if in_section_with_ai_chat_access_essential_only?
    return AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end

  private def in_section_with_ai_chat_access_enabled?
    sections_as_student.any? {|s| !s.hidden && s.ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED]}
  end

  private def in_section_with_ai_chat_access_essential_only?
    sections_as_student.any? {|s| !s.hidden && s.ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY]}
  end

  # A teacher is international when they (the teacher) are non-US. A student is
  # international when they have teachers and all of them are non-US.
  private def international_ai_chat_user?
    return @international_ai_chat_user if defined?(@international_ai_chat_user)
    @international_ai_chat_user =
      if DCDO.get("allow_international_usage_all_models", false)
        false
      elsif teacher?
        non_us_teacher?(self)
      else
        student_teachers = teachers
        student_teachers.any? && student_teachers.all? {|teacher| non_us_teacher?(teacher)}
      end
  end

  # We use school_info and user_geos (set once at first sign-in) rather than per request
  # geolocation so the value stays stable and can be fixed by the teacher if it is wrong.
  private def non_us_teacher?(teacher)
    return !teacher.school_info.usa? if teacher.school_info&.country.present?
    geo_country = teacher.user_geos.first&.country
    geo_country.present? && geo_country != 'United States'
  end
end
