class CreateTeacherNotifications < ActiveRecord::Migration[6.1]
  def up
    create_table :teacher_notifications do |t|
      t.integer :user_id, null: false
      t.string :external_id, null: false
      t.string :title, null: false
      t.text :description, null: false
      t.string :icon_name
      t.string :icon_color
      t.json :href_links
      t.json :ai_prompts
      t.integer :priority, default: 0
      t.datetime :published_at
      t.datetime :expires_at
      t.datetime :read_at
      t.boolean :is_dismissed, default: false, null: false

      t.timestamps
    end

    add_foreign_key :teacher_notifications, :users
    add_index :teacher_notifications, [:user_id, :read_at]
    add_index :teacher_notifications, [:user_id, :created_at]
    add_index :teacher_notifications, [:user_id, :is_dismissed]
    add_index :teacher_notifications, :external_id
  end

  def down
    return unless table_exists?(:teacher_notifications)

    remove_foreign_key :teacher_notifications, :users
    remove_index :teacher_notifications, [:user_id, :read_at]
    remove_index :teacher_notifications, [:user_id, :created_at]
    remove_index :teacher_notifications, [:user_id, :is_dismissed]
    remove_index :teacher_notifications, :external_id
    drop_table :teacher_notifications
  end
end
