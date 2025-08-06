class CreateNotifications < ActiveRecord::Migration[6.1]
  def up
    return if table_exists?(:notifications)

    create_table :notifications do |t|
      t.integer :user_id, null: false
      t.string :external_id
      t.string :title, null: false
      t.text :description
      t.string :notification_type
      t.datetime :read_at
      t.boolean :is_dismissed, default: false, null: false
      t.string :link_url
      t.json :ai_prompts
      t.string :icon_name
      t.datetime :expires_at
      t.integer :priority, default: 0, null: false

      t.timestamps
    end

    add_foreign_key :notifications, :users
    add_index :notifications, [:user_id, :read_at, :expires_at]
    add_index :notifications, [:user_id, :created_at]
  end

  def down
    return unless table_exists?(:notifications)

    remove_foreign_key :notifications, :users
    remove_index :notifications, [:user_id, :created_at]
    remove_index :notifications, [:user_id, :read_at, :expires_at]
    drop_table :notifications
  end
end
