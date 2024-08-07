class CreateAichatRequests < ActiveRecord::Migration[6.1]
  def change
    # use utf8mb4 to support emoji
    create_table :aichat_requests, charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :user_id, null: false
      t.json :model_customizations, null: false
      t.json :stored_messages
      t.text :new_message, null: false
      t.integer :status
      t.text :response

      t.timestamps
    end
  end
end
