class CreateRubrics < ActiveRecord::Migration[6.1]
  def change
    create_table :rubrics do |t|
      t.integer :lesson_id
      t.integer :level_id

      t.timestamps
    end
  end
end
