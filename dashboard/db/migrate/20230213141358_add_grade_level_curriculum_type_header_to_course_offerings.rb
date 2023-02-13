class AddGradeLevelCurriculumTypeHeaderToCourseOfferings < ActiveRecord::Migration[6.0]
  def change
    add_column :course_offerings, :grade_level, :string
    add_column :course_offerings, :curriculum_type, :string
    add_column :course_offerings, :header, :string
  end
end
