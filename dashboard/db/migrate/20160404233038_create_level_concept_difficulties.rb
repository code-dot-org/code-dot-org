class CreateLevelConceptDifficulties < ActiveRecord::Migration
  def change
    create_table :level_concept_difficulties do |t|
      t.references :level, index: true, foreign_key: true
      t.timestamps null: false

      t.integer :sequencing, default: 0, null: false
      t.integer :debugging, default: 0, null: false
      t.integer :repeat_loops, default: 0, null: false
      t.integer :repeat_until_while, default: 0, null: false
      t.integer :for_loops, default: 0, null: false
      t.integer :events, default: 0, null: false
      t.integer :variables, default: 0, null: false
      t.integer :functions, default: 0, null: false
      t.integer :functions_with_params, default: 0, null: false
      t.integer :conditionals, default: 0, null: false
    end
  end
end
