class AddIndexesToLevelSourceHints < ActiveRecord::Migration
  def change
    add_index :level_source_hints, :level_source_id
    add_index :level_source_hints, [:level_source_id, :hint_id], :unique => true
  end
end
