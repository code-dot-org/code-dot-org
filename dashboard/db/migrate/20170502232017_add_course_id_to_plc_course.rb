class AddCourseIdToPlcCourse < ActiveRecord::Migration[5.0]
  def change
    add_column :plc_courses, :course_id, :integer
  end
end
