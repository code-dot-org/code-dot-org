class CreateProfessionalLearningCourse < ActiveRecord::Migration
  def change
    create_table :@plc_professional_learning_courses do |t|
      t.string :name
    end
  end
end
