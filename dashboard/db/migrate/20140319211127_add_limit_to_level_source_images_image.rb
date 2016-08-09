class AddLimitToLevelSourceImagesImage < ActiveRecord::Migration
  def change
    change_column :level_source_images, :image, :binary, limit: 16_777_215
  end
end
