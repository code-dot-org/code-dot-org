module Plc::CoursesHelper
  def options_for_user_enrollment_courses
    Plc::Course.where.not(name: 'All The PLC Things').pluck(:name, :id).sort
  end
end
