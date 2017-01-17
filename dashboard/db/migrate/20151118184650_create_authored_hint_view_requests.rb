class CreateAuthoredHintViewRequests < ActiveRecord::Migration[4.2]
  def change
    create_table :authored_hint_view_requests do |t|
      t.references :user, index: true, foreign_key: true
      t.references :script, foreign_key: true
      t.references :level, foreign_key: true
      t.string :hint_id
      t.string :hint_class
      t.string :hint_type
      t.integer :prev_time
      t.integer :prev_attempt
      t.integer :prev_test_result
      t.integer :prev_activity_id
      t.integer :prev_level_source_id
      t.integer :next_time
      t.integer :next_attempt
      t.integer :next_test_result
      t.integer :next_activity_id
      t.integer :next_level_source_id
      t.integer :final_time
      t.integer :final_attempt
      t.integer :final_test_result
      t.integer :final_activity_id
      t.integer :final_level_source_id

      t.timestamps null: false
    end

    add_index :authored_hint_view_requests, [:script_id, :level_id]
    add_index :authored_hint_view_requests, [:user_id, :script_id, :level_id, :hint_id], name: 'index_authored_hint_view_requests_on_all_related_ids'
  end
end
