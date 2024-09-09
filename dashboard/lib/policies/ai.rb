require 'user'

class Policies::Ai
  # Whether or not AI rubric features (AI TA) are enabled.
  def self.ai_rubrics_enabled?(user)
    return false if user.nil? || !user.verified_teacher?
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
end
