class RemoveActivityIdFromGalleryActivities < ActiveRecord::Migration[5.0]
  def change
    remove_column :gallery_activities, :activity_id, :integer
  end
end
