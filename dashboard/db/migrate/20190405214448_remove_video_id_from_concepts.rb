class RemoveVideoIdFromConcepts < ActiveRecord::Migration[5.0]
  def change
    remove_column :concepts, :video_id, :integer
  end
end
