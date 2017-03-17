class DropAuthoredHintViewRequestColumns < ActiveRecord::Migration[5.0]
  def change
    remove_column :authored_hint_view_requests, :prev_activity_id, :integer
    remove_column :authored_hint_view_requests, :next_activity_id, :integer
    remove_column :authored_hint_view_requests, :final_activity_id, :integer
  end
end
