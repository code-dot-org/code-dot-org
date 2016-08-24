class AddIndexOnActivityIdToGalleryActivities < ActiveRecord::Migration[4.2]
  def change
    add_index :gallery_activities, :activity_id
  end
end
