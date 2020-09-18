class CreateActivitySections < ActiveRecord::Migration[5.0]
  def change
    create_table :activity_sections do |t|
      t.integer :lesson_activity_id, null: false, index: true
      t.integer :position, null: false
      t.string :properties

      t.timestamps
    end
  end
end
