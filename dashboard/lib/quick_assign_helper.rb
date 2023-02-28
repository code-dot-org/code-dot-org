module QuickAssignHelper
  def self.course_offerings(user, locale)
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

      data[co.curriculum_type] ||= {}
      data[co.curriculum_type][co.header] ||= []
      data[co.curriculum_type][co.header].append(co.summarize_for_quick_assign(user, locale))
    end

    # Sort the headers and the course offerings
    data.keys.each do |curriculum_type|
      data[curriculum_type].keys.each do |header|
        data[curriculum_type][header].sort_by! {|co| co[:display_name]}
      end
      data[curriculum_type] = data[curriculum_type].sort.to_h
    end

    data
  end

  # Helper function to compare headers so that "Favorites" is always first in the list
  def self.compare_headers(h1, h2)
    return -1 if h1 == Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.favorites
    return 1 if h2 == Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.favorites
    h1 <=> h2
  end

  # We want to organize the course offerings by their headers then sort those headers
  # according to the logic in compare_headers above
  # The offerings within a header will be sorted alphabetically by display_name.
  # Any course_offerings that do not a header will be ignored.
  def self.group_hoc_and_pl_offerings(course_offerings, user, locale)
    data = {}
    course_offerings.each do |co|
      next if co.header.blank?

      data[co.header] ||= []
      data[co.header].append(co.summarize_for_quick_assign(user, locale))
    end

    data.keys.each do |header|
      data[header].sort_by! {|co| co[:display_name]}
    end
    data.sort {|(h1, _), (h2, _)| compare_headers(h1, h2)}.to_h
  end
end
