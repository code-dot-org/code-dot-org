class CreateProfessionalLearningCourse < ActiveRecord::Migration
  def change
    create_table :professional_learning_courses do |t|
      t.string :name
    end
  end
end
