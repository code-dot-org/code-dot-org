class RemoveScriptLevelIdFromTeacherFeedbacks < ActiveRecord::Migration[5.2]
  def change
    remove_column :teacher_feedbacks, :script_level_id
  end
end
