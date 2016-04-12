module Plc::CoursesHelper
  def options_for_user_enrollment_courses
    Plc::Course.all.pluck(:name, :id).sort
  end
end
