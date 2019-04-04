class AddVideoKeyToConcepts < ActiveRecord::Migration[5.0]
  def change
    add_column :concepts, :video_key, :string
    add_index :concepts, :video_key
  end
end
