class AddStartedToPlcCourseUnit < ActiveRecord::Migration
  def change
    add_column :plc_course_units, :started, :boolean, null: false, default: false
  end
end
