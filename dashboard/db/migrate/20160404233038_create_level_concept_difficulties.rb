class CreateLevelConceptDifficulties < ActiveRecord::Migration
  def change
    create_table :level_concept_difficulties do |t|
      t.references :level, index: true, foreign_key: true
      t.timestamps null: false

      t.integer :sequencing, null: true
      t.integer :debugging, null: true
      t.integer :repeat_loops, null: true
      t.integer :repeat_until_while, null: true
      t.integer :for_loops, null: true
      t.integer :events, null: true
      t.integer :variables, null: true
      t.integer :functions, null: true
      t.integer :functions_with_params, null: true
      t.integer :conditionals, null: true
    end
  end
end
