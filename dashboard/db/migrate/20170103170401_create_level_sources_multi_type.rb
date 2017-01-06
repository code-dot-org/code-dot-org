class CreateLevelSourcesMultiType < ActiveRecord::Migration[5.0]
  def change
    create_table :level_sources_multi_types do |t|
      t.integer :level_source_id, null: false, index: true
      t.integer :level_id, null: false, index: true
      t.text :data
      t.string :md5, null: false
      t.boolean :hidden
    end
  end
end
