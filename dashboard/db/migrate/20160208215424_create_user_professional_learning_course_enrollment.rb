class CreateUserProfessionalLearningCourseEnrollment < ActiveRecord::Migration[4.2]
  def change
    create_table :user_professional_learning_course_enrollments do |t|
      t.references :user, index: true, foreign_key: true
      t.references :professional_learning_course, index: {name: 'enrollment_plc_index'}, foreign_key: true
      t.string :status
    end
  end
end
