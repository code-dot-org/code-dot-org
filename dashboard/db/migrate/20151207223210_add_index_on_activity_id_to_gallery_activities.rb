class AddIndexOnActivityIdToGalleryActivities < ActiveRecord::Migration
  def change
    add_index :gallery_activities, :activity_id
  end
end
