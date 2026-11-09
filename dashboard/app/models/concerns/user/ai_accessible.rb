# Adds methods for determining and enforcing AI access rules.
module User::AiAccessible
  extend ActiveSupport::Concern
  include SharedConstants

  TEACHER_PREVERIFICATION_PILOT = 'teacher-preverification'.freeze
  SPRITELAB2_AI_PILOT = 'ai-in-your-program-pilot'.freeze

  # Chat apis trust the client to decide if it can access chat features
  # This allows us the flexibility to do things like experiment with new
  # lab types with low friction.
  def trust_chat_client?(client_type)
    client_type == AI_CHAT_CLIENT_TYPES[:FLOW_LAB]
  end

  # Lesson deep dive is not tied to a level, so essential-only access does not unlock it.
  def can_use_lesson_deep_dive?
    return false unless DCDO.get('lesson-deep-dive-enabled', true)
    ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED]
  end

  # Teachers follow their own access; a student needs a visible section with chat enabled and challenges on.
  def can_use_lesson_deep_dive_challenges?
    return false unless can_use_lesson_deep_dive?
    return true if teacher_can_access_aichat? || levelbuilder?
    sections_as_student.any? {|s| !s.hidden && s.ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED] && s.ai_challenge_enabled}
  end

  def can_use_ai_iteration_tools?
    levelbuilder?
  end

  def in_spritelab2_ai_pilot?
    levelbuilder? ||
      has_pilot_experiment?(SPRITELAB2_AI_PILOT) ||
      teachers.any? {|teacher| teacher.has_pilot_experiment?(SPRITELAB2_AI_PILOT)}
  end

  def spritelab_ask_ai_refusal
    # First: the client hides the blocks on this reason alone.
    return SPRITELAB_ASK_AI_REFUSALS[:NOT_IN_PILOT] unless in_spritelab2_ai_pilot?
    return SPRITELAB_ASK_AI_REFUSALS[:OFF] unless DCDO.get('spritelab-lab2-ask-ai-enabled', true)
    # Essential-only won't do: it would trust a client-supplied level id.
    return SPRITELAB_ASK_AI_REFUSALS[:NO_ACCESS] unless ai_chat_access_level == AI_CHAT_ACCESS_LEVELS[:ENABLED]
    # The gateway's fallback serves only adaptive and the tutor.
    return SPRITELAB_ASK_AI_REFUSALS[:REGION_BLOCKED] if blocked_aichat_providers.any?
    nil
  end

  def teacher_can_access_aichat?
    teacher? && (verified_instructor? || oauth? || Policies::Lti.lti?(self) || SingleUserExperiment.enabled?(user: self, experiment_name: TEACHER_PREVERIFICATION_PILOT))
  end

  def ai_chat_access_level
    return AI_CHAT_ACCESS_LEVELS[:ENABLED] if teacher_can_access_aichat? || levelbuilder?
    section_enabled_access_level
  end

  def blocked_aichat_providers
    return [] if levelbuilder?
    international_ai_chat_user? ? AI_CHAT_US_ONLY_PROVIDERS : []
  end

  def ai_gateway_fallback_allowed?(client_type)
    DCDO.get('ai_gateway_fallback_is_enabled', false) &&
      AI_GATEWAY_FALLBACK_CLIENT_TYPES.include?(client_type)
  end

  # Without a client type, as on the Rails chat path, no fallback applies.
  def can_use_aichat_model?(model_id, client_type: nil)
    provider = AI_CHAT_PROVIDER_BY_MODEL_ID[model_id]
    return true if provider.nil? || blocked_aichat_providers.exclude?(provider)
    ai_gateway_fallback_allowed?(client_type) && AI_CHAT_GEMINI_IMAGE_MODEL_IDS.exclude?(model_id)
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
    return false if client_type == AI_CHAT_CLIENT_TYPES[:ADAPTIVE] && !DCDO.get("adaptive-ai-enabled", false)
    return false if client_type == AI_CHAT_CLIENT_TYPES[:THEATER_DESCRIPTION] && !DCDO.get("theater-ai-descriptions-enabled", false)
    return false if client_type == AI_CHAT_CLIENT_TYPES[:LESSON_DEEP_DIVE] && !can_use_lesson_deep_dive?
    return false if client_type == AI_CHAT_CLIENT_TYPES[:CURRICULUM_GENERATOR] && !levelbuilder?
    return false if client_type == AI_CHAT_CLIENT_TYPES[:SPRITELAB_ASK_AI] && spritelab_ask_ai_refusal

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
