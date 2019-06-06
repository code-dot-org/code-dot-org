class ChangeIntegerToBigintInGalleryActivities < ActiveRecord::Migration[5.0]
  def up
    change_column :gallery_activities, :user_level_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :gallery_activities, :user_level_id, :integer
  end
end
