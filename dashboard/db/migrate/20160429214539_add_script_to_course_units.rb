class AddScriptToCourseUnits < ActiveRecord::Migration
  def change
    Plc::CourseUnit.destroy_all
    add_reference :plc_course_units, :script, index: true, foreign_key: true, required: true
  end
end
