module Plc::CoursesHelper
  def options_for_user_enrollment_courses
    Plc::Course.all.map {|c| [c.name, c.id]}.sort
  end

  def options_for_plc_course_launch
    Plc::CourseUnit.all.map {|c| [c.name, c.id]}.sort
  end
end
