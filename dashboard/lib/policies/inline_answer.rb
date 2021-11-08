# This class contains policies relating to our "teachers can view levels with
# the answers included" feature
class Policies::InlineAnswer
  # Returns a boolean indicating whether or not the given user should be
  # allowed to view answers for the given script_level
  def self.visible_for_script_level?(user, script_level)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless script_level

    script = script_level.try(:script)
    return true if visible_for_script?(user, script)

    # Teachers can also put lessons into a readonly mode in which students are
    # able to view the answers
    user_level = UserLevel.find_by(user: user, level: script_level.level, script: script_level.script)
    return true if user_level.try(:readonly_answers)

    false
  end

  # Returns a boolean indicating whether or not the given user should be
  # allowed to view answers for the given script_level
  def self.visible_for_script?(user, script)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless script

    # Authorized instructors who are instructing the course can view answers
    return true if user.verified_instructor? &&
        script&.can_be_instructor?(user) && !script.old_professional_learning_course?

    # For CSF scripts any teacher account should be able to see teacher only markdown and answers
    # even if they are not authorized
    return true if user.try(:teacher?) && (script&.k5_course? || script&.k5_draft_course?)

    false
  end
end
