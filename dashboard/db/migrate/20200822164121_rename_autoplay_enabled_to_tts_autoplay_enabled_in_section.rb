class RenameAutoplayEnabledToTtsAutoplayEnabledInSection < ActiveRecord::Migration[5.0]
  def change
    rename_column :sections, :autoplay_enabled, :tts_autoplay_enabled
  end
end
