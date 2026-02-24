class AddThemeToUserPreferences < ActiveRecord::Migration[6.1]
  def change
    add_column :user_preferences, :theme, :json
  end
end
