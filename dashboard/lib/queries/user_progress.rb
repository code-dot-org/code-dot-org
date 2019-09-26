class Queries::UserProgress
  def self.user_levels_by_level(user, script)
    user.user_levels.
      where(script_id: script.id).
      index_by(&:level_id)
  end
end
