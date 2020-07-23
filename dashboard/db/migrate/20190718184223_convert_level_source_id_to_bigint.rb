class ConvertLevelSourceIdToBigint < ActiveRecord::Migration[5.0]
  def up
    change_column :level_sources_multi_types, :level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :level_sources_multi_types, :level_source_id, :int
  end
end
