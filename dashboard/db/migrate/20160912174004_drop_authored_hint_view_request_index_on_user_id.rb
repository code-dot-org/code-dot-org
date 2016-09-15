class DropAuthoredHintViewRequestIndexOnUserId < ActiveRecord::Migration[5.0]
  def change
    remove_index :authored_hint_view_requests, column: :user_id
  end
end
