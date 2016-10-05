class AddUserLevelAndLevelSourceToGalleryActivity < ActiveRecord::Migration[5.0]
  def change
    change_table(:gallery_activities) do |t|
      t.belongs_to :level_source, after: :activity_id
      t.belongs_to :user_level, after: :activity_id
      t.index [:user_id, :level_source_id]
    end
  end
end
