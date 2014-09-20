class CreateLevelBlock < ActiveRecord::Migration
  def change
    create_table :level_blocks do |t|
      t.references :level, null: false, index: true
      t.references :block, null: false
      t.string :type, null: false

      t.timestamps
    end

  end
end
