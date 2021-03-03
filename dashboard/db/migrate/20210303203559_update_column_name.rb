class UpdateColumnName < ActiveRecord::Migration[5.2]
  def change
    rename_column :sections, :tts_autoplay_enabled, :autoplay_enabled
  end
end
