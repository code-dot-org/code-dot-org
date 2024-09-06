class Policies::Ai
  # Units that enable the Differentiation feature
  UNIT_DIFFERENTIATION_ALLOWLIST = %w[
    csd3-2023
    interactive-games-animations-2023
    focus-on-creativity3-2023
    focus-on-coding3-2023
    interactive-games-animations-2024
    focus-on-creativity3-2024
    focus-on-coding3-2024
  ]

  # UnitGroups that enable the Differentiation feature
  UNIT_GROUP_DIFFERENTIATION_ALLOWLIST = %w[
    csd-2023
    csd-2024
  ]

  # Whether or not AI rubric features (AI TA) are enabled.
  def self.ai_rubrics_enabled?(user)
    return false if user.nil?

    !user.ai_rubrics_disabled
  end

  # Whether or not AI features are enabled for a particular user and level.
  def self.ai_rubrics_enabled_for_script_level?(user, script_level)
    return false if user.nil?
    return false if script_level.nil?

    sections = user.sections_as_student
    return false if sections.empty?

    # Get sections that contain the given script_level (or aren't related to any unit)
    sections = sections.select {|s| s.script.nil? || s.script.try(:id) == script_level.script.id}

    # It is enabled if any of these sections have a teacher that has not opted-out
    sections.any? do |section|
      Policies::Ai.ai_rubrics_enabled?(section.user)
    end
  end

  def self.ai_differentiation_enabled?(user)
    # Disabled unless there is an actual user (folks who are logged out)
    return false unless user

    # Must be a teacher
    return false unless user.teacher?

    # An individual opt-out can be supplied here if implemented
    true
  end

  def self.ai_differentiation_enabled_for_unit?(unit_or_unit_group)
    # Checks the allowlists of specifically enabled units for this feature
    return true if UNIT_DIFFERENTIATION_ALLOWLIST.include?(unit_or_unit_group&.name) && unit_or_unit_group.is_a?(Unit)
    return true if UNIT_GROUP_DIFFERENTIATION_ALLOWLIST.include?(unit_or_unit_group&.name) && unit_or_unit_group.is_a?(UnitGroup)

    # Otherwise, disabled
    false
  end

  def self.ai_differentiation_enabled_for_lesson?(lesson)
    # Currently, all lessons of an allowed unit will allow ai differentiation features
    return true if ai_differentiation_enabled_for_unit?(lesson&.script)

    # Otherwise, disabled
    false
  end
end
