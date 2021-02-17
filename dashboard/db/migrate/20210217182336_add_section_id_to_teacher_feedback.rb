class AddSectionIdToTeacherFeedback < ActiveRecord::Migration[5.2]
  def change
    add_column :teacher_feedbacks, :section_id, :integer
  end
end
