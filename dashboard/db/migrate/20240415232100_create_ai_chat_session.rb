class CreateAiChatSession < ActiveRecord::Migration[6.1]
  def change
    # use utf8mb4 to support emoji
    create_table :ai_chat_sessions, charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :user_id, index: true
      t.integer :level_id
      t.integer :script_id
      t.integer :project_id
      t.text :model_customizations
      t.text :messages
      t.timestamps
    end
  end
end
