module QuickAssignHelper
  def self.course_offerings(user, locale, participant_type)
    offerings = {}

    assignable_offerings = CourseOffering.assignable_course_offerings(user)
    assignable_elementary_offerings = assignable_offerings.filter(&:elementary_school_level?)
    assignable_middle_offerings = assignable_offerings.filter(&:middle_school_level?)
    assignable_high_offerings = assignable_offerings.filter(&:high_school_level?)
    assignable_hoc_offerings = assignable_offerings.filter(&:hoc?)

    offerings[:elementary] = group_grade_level_offerings(assignable_elementary_offerings, user, locale)
    offerings[:middle] = group_grade_level_offerings(assignable_middle_offerings, user, locale)
    offerings[:high] = group_grade_level_offerings(assignable_high_offerings, user, locale)
    offerings[:hoc] = group_hoc_and_pl_offerings(assignable_hoc_offerings, user, locale)

    unless participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
      # Courses with a participant_audience of student are shown in other places
      # in the quick assign component and should not be included with pl_offerings
      assignable_pl_offerings = assignable_offerings.filter do |co|
        co.get_participant_audience != 'student' &&
          Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCES_BY_TYPE[participant_type].include?(co.get_participant_audience)
      end
      offerings[:pl] = group_hoc_and_pl_offerings(assignable_pl_offerings, user, locale)
    end

    offerings
  end

  # We want to organize the course offerings in a very specific format.
  # In particular, we want to group by curriculum_type then header within each curriculum_type.
  # The headers within each curriculum_type will be sorted alphabetically.
  # The offerings within a header will be sorted alphabetically by display_name.
  # Any course_offerings that do not have a curriculum_type and a header will be ignored.
  def self.group_grade_level_offerings(course_offerings, user, locale)
    data = {}
    course_offerings.each do |co|
      next if co.header.blank? || co.curriculum_type.blank?

      header = localized_header(co.header)

      data[co.curriculum_type] ||= {}
      data[co.curriculum_type][header] ||= []
      data[co.curriculum_type][header].append(co.summarize_for_quick_assign(user, locale))
    end

    # Sort the headers and the course offerings
    data.keys.each do |curriculum_type|
      data[curriculum_type].keys.each do |header|
        data[curriculum_type][header].sort_by! {|co| co[:display_name]}
      end
      data[curriculum_type] = data[curriculum_type].sort {|(h1, _), (h2, _)| compare_headers(h1, h2)}.to_h
    end

    data
  end

  # Helper function to compare headers so that "Favorites" (hoc) and "Year Long" are always first
  def self.compare_headers(h1, h2)
    return -1 if h1 == localized_header('favorites') || h1 == localized_header('year_long')
    return 1 if h2 == localized_header('favorites') || h2 == localized_header('year_long')
    h1 <=> h2
  end

  # We want to organize the course offerings by their headers then sort those headers
  # according to the logic in compare_headers above
  # The offerings within a header will be sorted alphabetically by display_name.
  # Any course_offerings that do not have a header will be ignored.
  def self.group_hoc_and_pl_offerings(course_offerings, user, locale)
    data = {}
    course_offerings.each do |co|
      next if co.header.blank?

      header = localized_header(co.header)
      data[header] ||= []
      data[header].append(co.summarize_for_quick_assign(user, locale))
    end

    data.keys.each do |header|
      data[header].sort_by! {|co| co[:display_name]}
    end
    data.sort {|(h1, _), (h2, _)| compare_headers(h1, h2)}.to_h
  end

  def self.localized_header(header)
    localized_header = I18n.t("course_offering.headers.#{header}", default: nil)
    localized_header || header
  end
end
