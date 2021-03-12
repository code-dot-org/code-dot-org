class AddScriptIdToTeacherFeedbacks < ActiveRecord::Migration[5.2]
  def change
    add_column :teacher_feedbacks, :script_id, :integer
  end
end
