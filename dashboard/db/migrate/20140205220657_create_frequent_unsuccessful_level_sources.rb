class CreateFrequentUnsuccessfulLevelSources < ActiveRecord::Migration
  def change
    create_table :frequent_unsuccessful_level_sources do |t|
      t.integer :level_source_id, index: true, null: false
      t.boolean :active, null: false, default: false
      t.integer :level_id, index: true, null: false
      t.integer :num_of_attempts, index: true
      t.timestamps
    end
  end
end
