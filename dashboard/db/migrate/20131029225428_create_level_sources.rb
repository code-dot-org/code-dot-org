class CreateLevelSources < ActiveRecord::Migration
  def up
    create_table :level_sources do |t|
      t.references :level
      t.string :md5, limit: 32, null: false
      t.string :data, limit: 20000, null: false
      t.timestamps
    end

    add_index :level_sources, [:level_id, :md5]

    add_column :activities, :level_source_id, :int

    Activity.where('level_source_id is null').includes(:level).find_each do |activity|
      activity.update_attributes!(level_source: LevelSource.lookup(activity.level, activity.data))
    end

    remove_column :activities, :data
  end

  def down
    add_column :activities, :data, :string, limit: 20000
    Activity.connection.execute('update activities a inner join level_sources ls on ls.id = a.level_source_id set a.data = ls.data')

    remove_column :activities, :level_source_id
    drop_table :level_sources
  end
end
