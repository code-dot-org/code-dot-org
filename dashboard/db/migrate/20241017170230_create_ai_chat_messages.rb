class CreateAiChatMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :aichat_threads do |t|
      t.belongs_to :user, null: false
      t.text :external_id, null: false
      t.text :llm_version, null: false
      t.text :title
      t.integer :unit_id
      t.integer :level_id
      t.timestamps
    end

    create_table :aichat_messages do |t|
      t.belongs_to :aichat_thread, null: false
      t.text :external_id, null: false
      t.integer :role, null: false
      t.text :content, null: false
      t.boolean :is_preset, null: false
      t.timestamps
    end
  end
end
