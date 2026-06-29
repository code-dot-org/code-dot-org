class AddEditorSettingsToUserPreferences < ActiveRecord::Migration[6.1]
  def change
    add_column :user_preferences, :editor_settings, :json
  end
end
