class CreateLevelSourceImages < ActiveRecord::Migration[4.2]
  def change
    create_table :level_source_images do |t|
      t.integer :level_source_id, index: true
      t.binary :image
      t.timestamps
    end
  end
end
