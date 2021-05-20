class AddScriptLevelIdToTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :script_level_id, :integer
  end
end
