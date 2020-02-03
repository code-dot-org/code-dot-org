class ConvertLevelSourceIdToBigintUserLevels < ActiveRecord::Migration[5.0]
  def up
    change_column :user_levels, :level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :user_levels, :level_source_id, :int
  end
end
