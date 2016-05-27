module Plc::CourseUnitsHelper
  def options_for_course_units
    Plc::CourseUnit.all.pluck(:unit_name, :id).sort
  end
end
