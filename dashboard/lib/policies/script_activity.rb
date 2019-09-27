class Policies::ScriptActivity
  def self.completed?(user, script)
    user_script = user.user_scripts.find_by(script: script)
    return false unless user_script
    !!user_script.completed_at || user.completed_progression_levels?(script)
  end

  def self.a_level_passed?(user, script)
    user_levels = UserLevels.
      where(user: user, script: script).
      index_by(&:level_id)

    script.script_levels.detect do |script_level|
      user_level = user_levels[script_level.level_id]
      is_passed = (user_level && user_level.passing?)
      script_level.valid_progression_level? && is_passed
    end
  end

  def self.not_started?(user, script)
    !completed?(user, script) && !a_level_passed?(user, script)
  end
end
