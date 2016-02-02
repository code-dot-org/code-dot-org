class CreateProfessionalLearningCourses < ActiveRecord::Migration
  def change
    create_table :professional_learning_courses do |t|
      t.string :name

      t.timestamps null: false
    end
  end
end
