class CreateContainedLevelAnswers < ActiveRecord::Migration[5.0]
  def change
    create_table :contained_level_answers do |t|
      t.timestamps
      t.integer :level_id, null: false, index: true
      t.integer :answer_number, null: false
      t.text :answer_text
      t.boolean :correct
    end
  end
end
