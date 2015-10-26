module UserProgress

  # Given a user and a script, returns a hash
  # that maps level_id to best result.
  #
  # @param user [User]
  # @param script [Script]
  # @return [Hash] maps level_id to best result
  def UserProgress.script_progress(user, script)
    user_levels = user.user_levels_by_level(script)
    Hash[user_levels.map { |k, v| [k, v.best_result]}]
  end
end
