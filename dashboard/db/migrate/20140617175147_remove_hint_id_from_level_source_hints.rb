class RemoveHintIdFromLevelSourceHints < ActiveRecord::Migration
  def change
    remove_index :level_source_hints, :name => "index_level_source_hints_on_level_source_id_and_hint_id"
    remove_column :level_source_hints, :hint_id, :integer
  end
end
