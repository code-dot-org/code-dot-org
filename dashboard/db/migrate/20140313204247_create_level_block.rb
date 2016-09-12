class CreateLevelBlock < ActiveRecord::Migration[4.2]
  def change
    create_table :level_blocks do |t|
      t.references :level, null: false, index: true
      t.references :block, null: false
      t.string :type, null: false

      t.timestamps
    end
  end
end
