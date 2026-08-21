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
    # Levelbuilders are internal staff and stay enabled regardless of location
    # so they don't need extra account setup when building levels.
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if levelbuilder?
    # Block users we can confirm are outside the US, even otherwise-authorized
    # (e.g. verified) teachers.
    return AI_CHAT_ACCESS_LEVELS[:DISABLED] if international_ai_chat_user?
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if teacher_can_access_aichat?
    section_enabled_access_level
  end

  # Why ai_chat_access_level is DISABLED at the user level, or nil when access
  # is not disabled. The client uses this to pick the right message instead of
  # inferring the cause from access level + user type (which breaks once a
  # teacher can be disabled for more than one reason).
  def ai_chat_disabled_reason
    return nil unless ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:DISABLED]
    return AI_CHAT_DISABLED_REASONS[:INTERNATIONAL] if international_ai_chat_user?
    return AI_CHAT_DISABLED_REASONS[:TEACHER_NOT_VERIFIED] if teacher?
    AI_CHAT_DISABLED_REASONS[:NO_SECTION_ACCESS]
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
  # international when they have teachers and all of them are non-US. International
  # users are blocked by default; the allow_international_aichat_usage DCDO flag
  # is an escape hatch to re-enable access without a deploy.
  private def international_ai_chat_user?
    return @international_ai_chat_user if defined?(@international_ai_chat_user)
    @international_ai_chat_user =
      if DCDO.get("allow_international_aichat_usage", false)
        false
      elsif teacher?
        non_us_ai_chat_user?(self)
      else
        student_teachers = teachers
        student_teachers.any? && student_teachers.all? {|teacher| non_us_ai_chat_user?(teacher)}
      end
  end

  # True only when we can positively determine the user is outside the US, so we
  # never block users whose location we can't establish. Prefer school_info, but
  # only when it has a country (legacy rows may have only state/district data);
  # otherwise fall back to the most recent geolocation, and fail open if neither
  # is known.
  private def non_us_ai_chat_user?(user)
    return !user.school_info.usa? if user.school_info&.country.present?
    geo_country = user.user_geos.first&.country
    geo_country.present? && geo_country != 'United States'
  end
end
