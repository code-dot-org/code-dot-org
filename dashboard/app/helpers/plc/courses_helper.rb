module Plc::CoursesHelper
  def options_for_user_enrollment_courses
    Plc::Course.all.map {|c| [c.name, c.id]}.sort
  end

  def options_for_plc_course_launch
    Plc::CourseUnit.all.select {|pc| !pc.started}.map {|pc| [pc.name, pc.id]}.sort
  end

  def launched_plc_courses
    Plc::CourseUnit.all.select(&:started).map(&:name).sort
  end
end
