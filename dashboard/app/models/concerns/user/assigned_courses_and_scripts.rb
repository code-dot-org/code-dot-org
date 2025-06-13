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
end
