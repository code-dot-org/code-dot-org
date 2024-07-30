class CreateAichatEvents < ActiveRecord::Migration[6.1]
  def change
    # use utf8mb4 to support emojis
    create_table :aichat_events, charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :user_id
      t.integer :level_id
      t.integer :script_id
      t.integer :project_id
      t.json :aichat_event

      t.timestamps
    end

    add_index :aichat_events, [:user_id, :level_id, :script_id], unique: false, name: "index_ace_user_level_script"
  end
end
