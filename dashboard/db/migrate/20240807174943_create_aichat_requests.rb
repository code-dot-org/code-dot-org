class CreateAichatRequests < ActiveRecord::Migration[6.1]
  def change
    # use utf8mb4 to support emoji
    create_table :aichat_requests, charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :user_id, null: false
      t.integer :level_id
      t.integer :script_id
      t.integer :project_id
      t.json :model_customizations, null: false
      t.json :stored_messages, null: false
      t.json :new_message, null: false
      t.integer :execution_status, null: false
      t.text :response

      t.timestamps
    end
  end
end
