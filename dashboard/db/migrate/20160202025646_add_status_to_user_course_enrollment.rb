class AddStatusToUserCourseEnrollment < ActiveRecord::Migration
  def change
    add_column :user_course_enrollments, :status, :string
  end
end
