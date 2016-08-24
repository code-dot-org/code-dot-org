class AddScriptToCourseUnits < ActiveRecord::Migration[4.2]
  def change
    add_reference :plc_course_units, :script, index: true, foreign_key: true
  end
end
