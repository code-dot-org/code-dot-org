class RemoveForeignKeysFromAuthoredHintViewRequests < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :authored_hint_view_requests, :users
    remove_foreign_key :authored_hint_view_requests, :scripts
    remove_foreign_key :authored_hint_view_requests, :levels
  end
end
