class AddPropertiesAndDeletedAtToUserLevels < ActiveRecord::Migration[5.2]
  def change
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?

    # Several changes here:
    # 1) Add deleted_at column to support paranoia gem
    # 2) Add deleted_at to the unique index
    # 3) Switch the order of the columns in the unique index
    add_column :user_levels, :deleted_at, :datetime
    add_index :user_levels, [:user_id, :script_id, :level_id, :deleted_at], unique: true, name: 'index_user_levels_unique'
    remove_index :user_levels, column: [:user_id, :level_id, :script_id], unique: true

    # Add properties column
    add_column :user_levels, :properties, :text
  end
end
