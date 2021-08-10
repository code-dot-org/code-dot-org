class AddDeletedAtToUserScripts < ActiveRecord::Migration[5.2]
  def change
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?

    add_column :user_scripts, :deleted_at, :datetime
    add_index :user_scripts, [:user_id, :script_id, :deleted_at], unique: true
    remove_index :user_scripts, column: [:user_id, :script_id], unique: true
  end
end
