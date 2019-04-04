class AddVideoKeyToConcepts < ActiveRecord::Migration[5.0]
  def change
    rename_column :concepts, :video_id, :video_key
    change_column :concepts, :video_key, :string
  end
end
