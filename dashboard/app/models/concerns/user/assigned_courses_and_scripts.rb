module User::AssignedCoursesAndScripts
  extend ActiveSupport::Concern
  include User::SectionParticipation

  # Returns an array of hashes storing data for each unique course assigned to # sections that this user is a part of.
  # @return [Array{CourseData}]
  def assigned_courses
    section_courses.map(&:summarize_short)
  end

  def assigned_course?(course)
    section_courses.include?(course)
  end

  # Returns the set of courses the user has been assigned to or has progress in.
  def courses_as_participant
    visible_scripts.filter_map(&:unit_group).concat(section_courses).uniq
  end

  def visible_scripts
    scripts.map(&:cached).select {|s| [Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview].include?(s.get_published_state)}
  end

  def assigned_script?(script)
    section_scripts.include?(script) || section_courses.include?(script&.unit_group)
  end

  # Checks if there are any launched scripts assigned to the user.
  # @return [Array] of Scripts
  def visible_assigned_scripts
    user_scripts.where("assigned_at").
      map {|user_script| Unit.where(id: user_script.script.id).select(&:launched?)}.
      flatten
  end

  # Checks if there are any launched scripts assigned to the user.
  # @return [Boolean]
  def any_visible_assigned_scripts?
    visible_assigned_scripts.any?
  end

  # Checks if there are any launched scripts or courses assigned to the user.
  # @return [Boolean]
  def assigned_course_or_script?
    assigned_courses.any? || any_visible_assigned_scripts?
  end

  # Query to get the user_script the user was most recently assigned.
  def most_recently_assigned_user_script
    user_scripts.
      where.not(assigned_at: nil).
      reorder(assigned_at: :desc).
      first
  end

  # Get the UnitGroupUnit for the most recently assigned UserScript.
  def most_recently_assigned_unit_group_unit
    unit = most_recently_assigned_user_script&.script
    return unless unit
    # UserScript doesn't record the UnitGroup the user was in, so we will assume
    # it is the most recently created section.
    section = sections_as_student.select {|s| !s.hidden && s.script_id == unit.id}.last
    Queries::Courses.unit_group_unit(unit, section&.unit_group)
  end

  # Get script object of the user_script the user was most recently
  # assigned.
  def most_recently_assigned_script
    most_recently_assigned_user_script&.script
  end

  def can_access_most_recently_assigned_script?
    return false unless script = most_recently_assigned_user_script&.script

    !script.pilot? || script.has_pilot_access?(self)
  end

  # Check if the user's most recently assigned script is associated with at least
  # 1 live section they are enrolled in.
  def most_recent_assigned_script_in_live_section?
    recent_assigned_script_id = most_recently_assigned_script.id
    sections_as_student.any? {|section| section.script_id == recent_assigned_script_id && section.hidden == false}
  end

  # Figures out the unique set of scripts assigned to sections that this user
  # is a part of. Includes default scripts for any assigned courses as well.
  # @return [Array<Unit>]
  def section_scripts
    all_scripts = []
    all_sections.each do |section|
      if section.script.present?
        all_scripts << section.script
      elsif section.unit_group.present?
        all_scripts.concat(section.unit_group.default_units)
      end
    end

    all_scripts
  end

  # Query to get the user_script the user made the most recent progress
  # in.
  def user_script_with_most_recent_progress
    user_scripts.
      where.not(last_progress_at: nil).
      reorder(last_progress_at: :desc).
      first
  end

  # Get script object of the user_script the user made the most recent
  # progress in.
  def script_with_most_recent_progress
    user_script_with_most_recent_progress&.script
  end

  # Check if the user's most recently-assigned script is the same one
  # that they've most recently made progress in.
  def most_recent_progress_in_recently_assigned_script?
    return false if script_with_most_recent_progress.nil? || most_recently_assigned_script.nil?
    script_with_most_recent_progress == most_recently_assigned_script
  end

  # Check if the user has been assigned a new script since their most
  # recent progress in a script.
  def last_assignment_after_most_recent_progress?
    return false if most_recently_assigned_user_script.nil? || user_script_with_most_recent_progress.nil?
    assigned = most_recently_assigned_user_script
    last_progress = user_script_with_most_recent_progress
    assigned != last_progress && assigned[:assigned_at] >= last_progress[:last_progress_at]
  end
end
