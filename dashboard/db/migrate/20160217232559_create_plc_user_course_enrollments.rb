class CreatePlcUserCourseEnrollments < ActiveRecord::Migration[4.2]
  def change
    create_table :plc_user_course_enrollments do |t|
      t.string :status
      t.references :plc_course, index: true
      t.references :user, index: true

      t.timestamps null: false
    end
  end
end
