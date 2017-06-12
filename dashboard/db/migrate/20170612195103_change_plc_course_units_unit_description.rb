class ChangePlcCourseUnitsUnitDescription < ActiveRecord::Migration[5.0]
  def change
    reversible do |dir|
      change_table :plc_course_units do |t|
        dir.up do
          t.change :unit_description, :text
        end
        dir.down do
          t.change :unit_description, :string
        end
      end
    end
  end
end
