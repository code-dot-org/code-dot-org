class AssociateCourseAndPlcCourse < ActiveRecord::Migration[5.0]
  def up
    Plc::Course.all.each do |plc_course|
      course = Course.create(name: plc_course.name, plc_course_id: plc_course.id)
      plc_course.update!(course_id: course.id)
    end
  end
end
