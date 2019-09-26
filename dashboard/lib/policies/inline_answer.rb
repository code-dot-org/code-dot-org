class Policies::InlineAnswer
  def self.visible?(user, script_level)
    return true if Rails.application.config.levelbuilder_mode
    return false unless user
    return false unless script_level

    script = script_level.try(:script)
    return true if user.authorized_teacher? &&
      script &&
      !script.professional_learning_course?

    user_level = UserLevel.find_by(user: user, level: script_level.level)
    return true if user_level.try(:readonly_answers)

    false
  end
end
