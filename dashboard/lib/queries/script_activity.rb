class Queries::ScriptActivity
  # Retrieve all scripts this user has started but not yet completed
  # return [Script]
  def self.working_on_units(user)
    user.scripts.where('user_scripts.completed_at is null').map(&:cached).select(&:launched?)
  end

  # Retrieve all scripts this user has started but not yet completed
  # return [Script]
  def self.working_on_student_units(user)
    working_on_units(user).select {|s| !s.pl_course?}
  end

  # Retrieve all scripts this user has started but not yet completed
  # return [Script]
  def self.working_on_pl_units(user)
    working_on_units(user).select(&:pl_course?)
  end

  # Retrieve all UserScripts for scripts this user has started but not yet
  # completed
  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  #
  # return [UserScript]
  def self.working_on_user_scripts(user)
    user.user_scripts.where('user_scripts.completed_at is null')
  end

  # Retrieve all UserScripts for scripts this user has completed
  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  #
  # return [UserScript]
  def self.completed_user_scripts(user)
    user.user_scripts.where('user_scripts.completed_at is not null')
  end

  # return the primary unit with progress for all student units
  def self.primary_student_unit(user)
    working_on_student_units(user).first.try(:cached)
  end

  # return the primary unit with progress for all pl units
  def self.primary_pl_unit(user)
    working_on_pl_units(user).first.try(:cached)
  end

  # Retrieve all UserScripts for scripts for which the user has any amount of
  # progress
  # return [UserScript]
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
