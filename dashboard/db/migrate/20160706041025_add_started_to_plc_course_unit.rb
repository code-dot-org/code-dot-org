class AddStartedToPlcCourseUnit < ActiveRecord::Migration
  def change
    add_column :plc_course_units, :started, :boolean

    Plc::CourseUnit.update_all(started: true)
  end
end
