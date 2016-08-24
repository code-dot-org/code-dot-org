class LevelSourceHintIdCanBeNull < ActiveRecord::Migration[4.2]
  def change
    change_column_null(:activity_hints, :level_source_hint_id, true)
  end
end
