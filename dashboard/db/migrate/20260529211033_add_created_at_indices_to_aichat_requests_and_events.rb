class AddCreatedAtIndicesToAichatRequestsAndEvents < ActiveRecord::Migration[7.0]
  def change
    add_index :aichat_events, :created_at
    add_index :aichat_requests, :created_at
  end
end
