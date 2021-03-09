class MakeScriptLevelIdInNullableInTeacherFeedbacks < ActiveRecord::Migration[5.2]
  def up
    change_column :teacher_feedbacks, :script_level_id, :integer, null: true
  end

  def down
    change_column :teacher_feedbacks, :script_level_id, :integer, null: false
  end
end
