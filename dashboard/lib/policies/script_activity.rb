class Policies::ScriptActivity
  def self.completed?(user, script)
    return false unless user
    return false unless script
    user_script = user.user_scripts.find_by(script: script)
    return false unless user_script
    !!user_script.completed_at || user.completed_progression_levels?(script)
  end

  def self.can_view_congrats_page?(user, script)
    return false unless script

    return true if script.hoc?
    return true if script.csf?
    return true if script.csc?

    completed?(user, script)
  end
end
