class ChangePlcCourseUnitsUnitDescription < ActiveRecord::Migration[5.0]
  def up
    change_table :plc_course_units do |t|
      t.change :unit_description, :text
    end
  end

  def down
    change_table :plc_course_units do |t|
      t.change :unit_description, :string
    end
  end
end
