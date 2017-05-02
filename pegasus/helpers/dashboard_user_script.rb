# TODO: Change the APIs below to check logged in user instead of passing in a user id
class DashboardUserScript
  # Assigns a script to all users enrolled in the section, creating a new user_scripts object if
  # necessary. The method noops for those user_scripts that already exist with assigned_at set.
  # WARNING: This method does not verify that the section and student_users exist (aren't deleted).
  def self.assign_script_to_section(script_id, section_id)
    student_user_ids = Dashboard.db[:followers].
      select(:student_user_id).
      where(section_id: section_id, deleted_at: nil).
      map {|f| f[:student_user_id]}
    DashboardUserScript.assign_script_to_users(script_id, student_user_ids)
  end

  # Assigns a script to the user via user_scripts, creating a new user_scripts object if necessary.
  # The method noops if a user_scripts already exists with assigned_at set.
  # @param script_id [Integer] The dashboard ID of the script.
  # @param user_id [Integer] The dashboard ID of the user.
  def self.assign_script_to_user(script_id, user_id)
    time_now = Time.now
    existing = Dashboard.db[:user_scripts].where(user_id: user_id, script_id: script_id).first
    if existing
      return if existing[:assigned_at]
      Dashboard.db[:user_scripts].where(user_id: user_id, script_id: script_id).update(
        updated_at: time_now,
        assigned_at: time_now
      )
    else
      Dashboard.db[:user_scripts].insert(
        user_id: user_id,
        script_id: script_id,
        created_at: time_now,
        updated_at: time_now,
        assigned_at: time_now
      )
    end
  end

  # Assigns a script to a set of users via user_scripts, creating new user_scripts objects if
  # necessary. The method noops for those user_scripts that already exist with assigned_at set.
  # WARNING: This method does not verify that the users exist (aren't deleted).
  def self.assign_script_to_users(script_id, user_ids)
    # NOTE: This method could be more simply written by iterating over user_ids, calling
    # DashboardUserScript#assign_script_to_user for each. This (more complex) approach is used for
    # its better DB performance.
    return if user_ids.empty?

    time_now = Time.now
    all_existing = Dashboard.db[:user_scripts].where(user_id: user_ids, script_id: script_id)
    all_existing_user_ids = all_existing.map {|user_script| user_script[:user_id]}

    missing_assigned_at = []
    all_existing.each do |existing|
      missing_assigned_at << existing[:id] unless existing[:assigned_at]
    end
    Dashboard.db[:user_scripts].where(id: missing_assigned_at).update(
      updated_at: time_now,
      assigned_at: time_now
    )
    missing_user_scripts = user_ids.select {|user_id| !all_existing_user_ids.include? user_id}
    return if missing_user_scripts.empty?
    Dashboard.db[:user_scripts].
      import(
        [:user_id, :script_id, :created_at, :updated_at, :assigned_at],
        missing_user_scripts.zip(
          [script_id] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count
        )
      )
  end
end
