class CreateExternalNotifications < ActiveRecord::Migration[6.1]
  def up
    return if table_exists?(:external_notifications)

    create_table :external_notifications do |t|
      t.integer :user_id, null: false
      t.string :external_id, null: false
      t.datetime :read_at
      t.boolean :is_dismissed, default: false, null: false

      t.timestamps
    end

    add_foreign_key :external_notifications, :users
    add_index :external_notifications, [:user_id, :read_at]
    add_index :external_notifications, [:user_id, :created_at]
  end

  def down
    return unless table_exists?(:external_notifications)

    remove_foreign_key :external_notifications, :users
    remove_index :external_notifications, [:user_id, :created_at]
    remove_index :external_notifications, [:user_id, :read_at]
    drop_table :external_notifications
  end
end
