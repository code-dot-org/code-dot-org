module Plc::CoursesHelper
  def options_for_user_enrollment_courses
    Plc::Course.all.map {|course| [course.name, course.id]}
  end
end
