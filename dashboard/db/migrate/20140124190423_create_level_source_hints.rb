class CreateLevelSourceHints < ActiveRecord::Migration
  def change
    create_table :level_source_hints do |t|
      t.integer :level_source_id, index: true
      t.text :hint
      t.integer :times_proposed
      t.float :priority
      t.timestamps
    end
  end
end
