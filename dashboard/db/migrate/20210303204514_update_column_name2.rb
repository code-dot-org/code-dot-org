class UpdateColumnName2 < ActiveRecord::Migration[5.2]
  def change
    rename_column :sections, :autoplay_enabled, :tts_autoplay_enabled
  end
end
