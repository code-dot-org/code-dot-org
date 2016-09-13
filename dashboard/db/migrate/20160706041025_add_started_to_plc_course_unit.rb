class AddStartedToPlcCourseUnit < ActiveRecord::Migration[4.2]
  def change
    add_column :plc_course_units, :started, :boolean, null: false, default: false
  end
end
