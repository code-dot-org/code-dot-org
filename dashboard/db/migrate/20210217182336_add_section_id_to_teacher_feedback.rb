class AddSectionIdToTeacherFeedback < ActiveRecord::Migration[5.2]
  def change
    add_column :teacher_feedbacks, :analytics_section_id, :integer
  end
end
