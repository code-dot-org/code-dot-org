module QuickAssignHelper
  def self.course_offerings(user, locale)
    offerings = {}

    assignable_offerings = CourseOffering.assignable_course_offerings(user)
    assignable_elementary_offerings = assignable_offerings.filter(&:elementary_school_level?)
    assignable_middle_offerings = assignable_offerings.filter(&:middle_school_level?)
    assignable_high_offerings = assignable_offerings.filter(&:high_school_level?)

    offerings[:elementary] = group_offerings(assignable_elementary_offerings, user, locale)
    offerings[:middle] = group_offerings(assignable_middle_offerings, user, locale)
    offerings[:high] = group_offerings(assignable_high_offerings, user, locale)

    offerings
  end

  def self.group_offerings(course_offerings, user, locale)
    data = {}
    course_offerings.each do |co|
      next if co.header.blank? || co.curriculum_type.blank?

      data[co.curriculum_type] ||= {}
      data[co.curriculum_type][co.header] ||= []
      data[co.curriculum_type][co.header].append(co.summarize_for_quick_assign(user, locale))
    end

    data.keys.each do |curriculum_type|
      data[curriculum_type].keys.each do |header|
        data[curriculum_type][header].sort_by! {|co| co[:display_name]}
      end
      data[curriculum_type] = data[curriculum_type].sort.to_h
    end

    data
  end
end
