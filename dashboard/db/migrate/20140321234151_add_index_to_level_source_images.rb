class AddIndexToLevelSourceImages < ActiveRecord::Migration
  def change
    add_index :level_source_images, :level_source_id
  end
end
