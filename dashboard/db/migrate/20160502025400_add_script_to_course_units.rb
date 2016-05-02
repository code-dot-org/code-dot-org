class AddScriptToCourseUnits < ActiveRecord::Migration
  def change
    add_reference :plc_course_units, :script, index: true, foreign_key: true
  end
end
