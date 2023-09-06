# This class contains policies relating to our content which only instructors can see
class Policies::InlineAnswer
  # Returns a boolean indicating whether or not the given user should be
  # allowed to view answers for the given script_level
  def self.visible_for_script_level?(user, script_level)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless script_level

    script = script_level.try(:script)
    return true if visible_for_unit?(user, script)

    return true if user.verified_instructor? && script_level&.view_as_instructor_in_training?(user)

    # Teachers can also put lessons into a readonly mode in which students are
    # able to view the answers
    user_level = UserLevel.find_by(user: user, level: script_level.level, script: script_level.script)
    return true if user_level.try(:readonly_answers)

    false
  end

  # Returns a boolean indicating whether or not the given user should be
  # allowed to view answers for the given unit
  def self.visible_for_unit?(user, unit)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless unit

    # Authorized instructors who are instructing the course can view answers
    return true if user.verified_instructor? &&
                   unit&.can_be_instructor?(user) && !unit.old_professional_learning_course?

    # For CSF scripts any teacher account should be able to see teacher only markdown and answers
    # even if they are not authorized
    return true if user.try(:teacher?) && (unit&.k5_course?)

    false
  end
end
