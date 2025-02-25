class Policies::Ai
  # Whether or not AI rubric features (AI TA) are enabled.
  def self.ai_rubrics_enabled?(user)
    return false if user.nil?
    return false unless user.verified_teacher?
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
    user.ai_differentiation_enabled
  end

  def self.ai_differentiation_enabled_for_unit?(unit_or_unit_group)
    # Documents are added to KB for all stable units.
    !!unit_or_unit_group.stable?
  end

  def self.ai_differentiation_enabled_for_lesson?(lesson)
    ai_differentiation_enabled_for_unit?(lesson&.script)
  end
end
