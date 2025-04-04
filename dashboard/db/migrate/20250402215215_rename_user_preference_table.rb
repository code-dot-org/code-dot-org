class RenameUserPreferenceTable < ActiveRecord::Migration[6.1]
  def change
    rename_table :user_preference, :user_preferences
  end
end
