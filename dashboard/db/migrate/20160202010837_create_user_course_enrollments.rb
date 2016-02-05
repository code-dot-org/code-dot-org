class CreateUserCourseEnrollments < ActiveRecord::Migration
  def change
    create_table :user_course_enrollments do |t|
      t.references :user, index: {:name => 'user_course_enrollment_user_index'}, foreign_key: true
      t.references :professional_learning_course, index: {:name => 'user_course_enrollment_plc_id_index'}, foreign_key: true

      t.timestamps null: false
    end
  end
end
