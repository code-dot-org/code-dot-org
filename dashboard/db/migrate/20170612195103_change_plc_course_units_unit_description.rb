class ChangePlcCourseUnitsUnitDescription < ActiveRecord::Migration[5.0]
  def up
    change_table :plc_course_units do |t|
      t.change :unit_description, :text
    end
  end

  def down
    change_table :plc_course_units do |t|
      ActiveRecord::Base.connection.execute(
        'UPDATE plc_course_units SET unit_description = SUBSTRING(unit_description, 1, 255)'
      )
      t.change :unit_description, :string
    end
  end
end
