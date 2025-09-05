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
    visible_scripts.filter_map(&:get_original_unit_group).concat(section_courses).uniq
  end

  def visible_scripts
    scripts.map(&:cached).select {|s| [Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview].include?(s.get_published_state)}
  end

  def assigned_script?(script)
    section_scripts.include?(script) || section_courses.include?(script&.get_original_unit_group)
  end

  # Checks if there are any launched scripts assigned to the user.
  # @return [Array] of Scripts
  def visible_assigned_scripts
    user_scripts.where.not(assigned_at: nil).
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

  # Return a collection of courses and scripts for the user.
  # First in the list will be courses enrolled in by the user's sections.
  # Following that will be all scripts in which the user has made progress that # are not in any of the enrolled courses.
  # @param exclude_primary_script [boolean]
  # Example: true when the primary_script is being used for a TopCourse on /home
  # @return [Array{CourseData, ScriptData}] an array of hashes of script and
  # course data
  def recent_pl_courses_and_units(exclude_primary_script)
    primary_script_id = Queries::ScriptActivity.primary_pl_unit(self).try(:id)

    # Filter out user_scripts that are already covered by a course
    unit_group_units_script_ids = courses_as_participant.map(&:default_unit_group_units).flatten.pluck(:script_id).uniq

    user_scripts = Queries::ScriptActivity.in_progress_and_completed_scripts(self).
      select {|user_script| unit_group_units_script_ids.exclude?(user_script.script_id)}

    pl_user_scripts = user_scripts.select {|us| us.script.pl_course?}

    user_script_data = pl_user_scripts.filter_map do |user_script|
      # Skip this script if we are excluding the primary script and this is the
      # primary script.
      if exclude_primary_script && user_script[:script_id] == primary_script_id
        nil
      else
        script_id = user_script[:script_id]
        script = Unit.get_from_cache(script_id)
        {
          name: script[:name],
          title: data_t_suffix('script.name', script[:name], 'title'),
          description: data_t_suffix('script.name', script[:name], 'description_short', default: ''),
          link: script_path(script),
        }
      end
    end

    user_course_data = courses_as_participant.select(&:pl_course?).map(&:summarize_short)

    user_course_data + user_script_data
  end

  # Return a collection of courses and scripts for the user.
  # First in the list will be courses enrolled in by the user's sections.
  # Following that will be all scripts in which the user has made progress that # are not in any of the enrolled courses.
  # @param exclude_primary_script [boolean]
  # Example: true when the primary_script is being used for a TopCourse on /home
  # @return [Array{CourseData, ScriptData}] an array of hashes of script and
  # course data
  # TODO: TEACH-1528 Update this to use a new UserCourses table. For now, this returns a /s/ url for each unit, displayed
  # on the student home page course tiles
  def recent_student_courses_and_units(exclude_primary_script)
    primary_script_id = Queries::ScriptActivity.primary_student_unit(self).try(:id)

    # Filter out user_scripts that are already covered by a course
    unit_group_units_script_ids = courses_as_participant.map(&:default_unit_group_units).flatten.pluck(:script_id).uniq

    user_scripts = Queries::ScriptActivity.in_progress_and_completed_scripts(self).
      select {|user_script| unit_group_units_script_ids.exclude?(user_script.script_id)}

    user_student_scripts = user_scripts.select {|us| !us.script.pl_course?}

    user_script_data = user_student_scripts.filter_map do |user_script|
      # Skip this script if we are excluding the primary script and this is the
      # primary script.
      if exclude_primary_script && user_script[:script_id] == primary_script_id
        nil
      else
        script_id = user_script[:script_id]
        script = Unit.get_from_cache(script_id)
        {
          name: script[:name],
          title: data_t_suffix('script.name', script[:name], 'title'),
          description: data_t_suffix('script.name', script[:name], 'description_short', default: ''),
          link: script_path(script),
        }
      end
    end

    user_course_data = courses_as_participant.select {|c| !c.pl_course?}.map(&:summarize_short)

    user_course_data + user_script_data
  end

  def pl_units_started
    user_scripts = Queries::ScriptActivity.in_progress_and_completed_scripts(self)
    pl_user_scripts = user_scripts.select {|us| us.script.pl_course?}
    pl_scripts = pl_user_scripts.map(&:script)

    percent_completed_by_script = {}
    pl_scripts.each do |pl_script|
      if pl_user_scripts.find {|us| us.script_id == pl_script.id}.completed_at
        percent_completed_by_script[pl_script.id] = 100
        next
      end
      num_levels_unpassed = num_unpassed_progression_levels(pl_script)
      total_levels = pl_script.levels.count
      next if total_levels == 0
      percent_completed_by_script[pl_script.id] = (((total_levels - num_levels_unpassed).to_f / total_levels) * 100).round
    end

    pl_scripts.map do |script|
      # TODO: TEACH-1555 Get the UnitGroupUnit from the user's activity.
      unit_group_unit = Queries::Courses.unit_group_unit(script)
      percent_completed = percent_completed_by_script[script.id] || 0
      {
        name: script.name,
        title: script.title_for_display,
        percent_completed: percent_completed,
        finish_url: percent_completed == 100 ? script.finish_url : nil,
        current_lesson_name: next_unpassed_progression_level(script)&.lesson&.localized_name,
        path: script.link(unit_group_unit: unit_group_unit),
      }
    end
  end
end
