# This class contains policies relating to our "teachers can view levels with
# the answers included" feature
class Policies::InlineAnswer
  # Returns a boolean indicating whether or not the given user should be
  # allowed to view answers for the given script_level
  def self.visible?(user, script_level)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless script_level

    # Authorized teachers can view answers, except for those scripts that
    # teachers are supposed to interface with as though they were students (ie,
    # professional learning scripts)
    script = script_level.try(:script)
    return true if user.authorized_teacher? &&
      script &&
      !script.professional_learning_course?

    # For CSF scripts teachers should be able to see teacher only markdown and answers
    # even if they are not authorized
    return true if user.try(:teacher?) && script && (script.k5_course? || script.k5_draft_course?)

    # Teachers can also put lessons into a readonly mode in which students are
    # able to view the answers
    user_level = UserLevel.find_by(user: user, level: script_level.level)
    return true if user_level.try(:readonly_answers)

    false
  end
end
