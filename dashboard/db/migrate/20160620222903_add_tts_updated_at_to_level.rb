class AddTtsUpdatedAtToLevel < ActiveRecord::Migration
  def change
    add_column :levels, :tts_updated_at, :timestamp
  end
end
