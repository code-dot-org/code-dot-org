class ChangeUserLevelIdToBigint < ActiveRecord::Migration[5.0]
  def up
    change_column :teacher_scores, :user_level_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :teacher_scores, :user_level_id, :int
  end
end
