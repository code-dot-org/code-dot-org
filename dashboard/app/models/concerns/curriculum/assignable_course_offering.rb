# Concern to find all the assignable course offerings for a user and
# be able to summarize them for assignment by the user.
#
# To use, include in a model and call the desired method.
module Curriculum::AssignableCourseOffering
  extend ActiveSupport::Concern

  def self.assignable_course_offerings(user)
    CourseOffering.all.select {|co| co.item_assignable?(user)}
  end

  def self.assignable_course_offerings_info(user)
    assignable_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user)}
  end

  def self.assignable_pl_course_offerings(user)
    assignable_course_offerings(user).select(&:pl_course?)
  end

  def self.assignable_pl_course_offerings_info(user)
    assignable_pl_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user)}
  end

  def item_assignable?(user)
    return true if launched?
    return true if Script.has_any_pilot_access?(user) && has_pilot_access?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER) && in_development?

    false
  end
end
