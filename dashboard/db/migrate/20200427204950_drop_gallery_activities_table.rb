class DropGalleryActivitiesTable < ActiveRecord::Migration[5.0]
  def change
    drop_table :gallery_activities
  end
end
