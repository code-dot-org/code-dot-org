class AddDescriptionSelfPacedProfessionalLearningProfessionalLearningProgramVideoPublishedDateToCourseOfferings < ActiveRecord::Migration[6.1]
  def change
    add_column :course_offerings, :description, :string
    add_column :course_offerings, :self_paced_professional_learning, :string
    add_column :course_offerings, :professional_learning_program, :string
    add_column :course_offerings, :video, :string
    add_column :course_offerings, :published_date, :datetime
  end
end
