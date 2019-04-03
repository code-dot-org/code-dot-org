class AddVideoKeyToConcepts < ActiveRecord::Migration[5.0]
  def change
    add_column :concepts, :video_key, :string
    remove_index :concepts, :video_id
    remove_foreign_key :concepts, :videos
    remove_column :concepts, :video_id, :int
    add_index :concepts, :video_key
  end
end
