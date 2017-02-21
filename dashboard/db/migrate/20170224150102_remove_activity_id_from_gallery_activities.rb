class RemoveActivityIdFromGalleryActivities < ActiveRecord::Migration[5.0]
  def change
    remove_column :gallery_activities, :activity_id, :integer
    remove_index :gallery_activities, name: :index_gallery_activities_on_user_id_and_activity_id
  end
end
