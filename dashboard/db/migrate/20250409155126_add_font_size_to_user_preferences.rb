class AddFontSizeToUserPreferences < ActiveRecord::Migration[6.1]
  def change
    add_column :user_preferences, :editor_font_size, :json
    add_column :user_preferences, :console_font_size, :json
  end
end
