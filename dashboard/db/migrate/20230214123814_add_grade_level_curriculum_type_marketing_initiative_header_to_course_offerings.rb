class AddGradeLevelCurriculumTypeMarketingInitiativeHeaderToCourseOfferings < ActiveRecord::Migration[6.0]
  def change
    add_column :course_offerings, :curriculum_type, :string
    add_column :course_offerings, :marketing_initiative, :string
    add_column :course_offerings, :grade_levels, :string
    add_column :course_offerings, :header, :string
  end
end
