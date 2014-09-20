class LevelSourceHintIdCanBeNull < ActiveRecord::Migration
  def change
    change_column_null(:activity_hints, :level_source_hint_id, true)
  end
end
