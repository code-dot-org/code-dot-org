module AichatAccessHelper
  # Determines the ai_chat_access_level to use when creating or updating a section.
  # If the section already has a non-disabled access level, it is preserved.
  # Otherwise, access is auto-enabled if the course has AI chat tools.
  def self.compute_ai_chat_access_level(assigned_course, previous_access_level = nil)
    previous_access_level ||= SharedConstants::AI_CHAT_ACCESS_LEVELS[:DISABLED]

    # Leave it as is if it was already turned on or to essential_only
    return previous_access_level if previous_access_level != SharedConstants::AI_CHAT_ACCESS_LEVELS[:DISABLED]

    # Auto-enable access if the course needs it.
    return SharedConstants::AI_CHAT_ACCESS_LEVELS[:ENABLED] if assigned_course&.has_ai_chat_tools?

    SharedConstants::AI_CHAT_ACCESS_LEVELS[:DISABLED]
  end
end
