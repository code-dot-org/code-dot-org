class Queries::ScriptActivity
  def self.working_on_scripts(user)
    user.scripts.where('user_scripts.completed_at is null').map(&:cached)
  end

  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  def self.working_on_user_scripts(user)
    user.user_scripts.where('user_scripts.completed_at is null')
  end

  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  def self.completed_user_scripts(user)
    user.user_scripts.where('user_scripts.completed_at is not null')
  end

  def self.primary_script(user)
    working_on_scripts(user).first.try(:cached)
  end

  def self.in_progress_and_completed_scripts(user)
    user.user_scripts.compact.reject do |user_script|
      user_script.script.nil?
    rescue
      # Getting user_script.script can raise if the script does not exist
      # In that case we should also reject this user_script.
      true
    end
  end
end
