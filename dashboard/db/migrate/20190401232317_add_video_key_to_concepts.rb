class AddVideoKeyToConcepts < ActiveRecord::Migration[5.0]
  def change
    add_column :concepts, :video_key, :string
    remove_column :concepts, :video_id

    Concept.reset_column_information
  end
end
