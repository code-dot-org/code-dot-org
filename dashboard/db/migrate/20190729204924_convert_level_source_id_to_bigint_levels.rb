class ConvertLevelSourceIdToBigintLevels < ActiveRecord::Migration[5.0]
  def up
    change_column :levels, :ideal_level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :levels, :ideal_level_source_id, :int
  end
end
