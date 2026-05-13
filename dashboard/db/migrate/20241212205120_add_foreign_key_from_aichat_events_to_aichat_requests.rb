class AddForeignKeyFromAichatEventsToAichatRequests < ActiveRecord::Migration[6.1]
  def change
    add_reference :aichat_events, :request, index: true, foreign_key: {to_table: :aichat_requests}, null: true
  end
end
