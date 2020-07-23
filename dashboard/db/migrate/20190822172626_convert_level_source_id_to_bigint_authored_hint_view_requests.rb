class ConvertLevelSourceIdToBigintAuthoredHintViewRequests < ActiveRecord::Migration[5.0]
  def up
    change_column :authored_hint_view_requests, :prev_level_source_id, 'BIGINT(11) UNSIGNED'
    change_column :authored_hint_view_requests, :next_level_source_id, 'BIGINT(11) UNSIGNED'
    change_column :authored_hint_view_requests, :final_level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :authored_hint_view_requests, :prev_level_source_id, :int
    change_column :authored_hint_view_requests, :next_level_source_id, :int
    change_column :authored_hint_view_requests, :final_level_source_id, :int
  end
end
