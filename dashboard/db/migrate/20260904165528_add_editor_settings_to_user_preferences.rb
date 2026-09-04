class AddEditorSettingsToUserPreferences < ActiveRecord::Migration[7.0]
  def change
    add_column :user_preferences, :editor_settings, :json
  end
end
