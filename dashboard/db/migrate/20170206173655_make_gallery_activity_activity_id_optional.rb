class MakeGalleryActivityActivityIdOptional < ActiveRecord::Migration[5.0]
  def up
    # As we intend to stop writing gallery_activity.activity_id, we change the
    # index to be non-unique and the column to allow null values. As these steps
    # are (mostly) irreversible, we do not offer a down method.
    rename_index :gallery_activities,
      'index_gallery_activities_on_user_id_and_activity_id',
      'index_gallery_activities_on_user_id_and_activity_id_unique'
    add_index :gallery_activities, [:user_id, :activity_id], unique: false
    change_column_null :gallery_activities, :activity_id, true
    remove_index :gallery_activities, name: 'index_gallery_activities_on_user_id_and_activity_id_unique'
  end
end
