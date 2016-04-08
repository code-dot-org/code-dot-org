class CreateUserProficiencies < ActiveRecord::Migration
  def change
    create_table :user_proficiencies do |t|
      t.references :user, index: true, foreign_key: true, null: false

      t.timestamps null: false
      t.datetime :last_progress_at

      t.integer :sequencing_d1_count, default: 0
      t.integer :sequencing_d2_count, default: 0
      t.integer :sequencing_d3_count, default: 0
      t.integer :sequencing_d4_count, default: 0
      t.integer :sequencing_d5_count, default: 0
      t.integer :debugging_d1_count, default: 0
      t.integer :debugging_d2_count, default: 0
      t.integer :debugging_d3_count, default: 0
      t.integer :debugging_d4_count, default: 0
      t.integer :debugging_d5_count, default: 0
      t.integer :repeat_loops_d1_count, default: 0
      t.integer :repeat_loops_d2_count, default: 0
      t.integer :repeat_loops_d3_count, default: 0
      t.integer :repeat_loops_d4_count, default: 0
      t.integer :repeat_loops_d5_count, default: 0
      t.integer :repeat_until_while_d1_count, default: 0
      t.integer :repeat_until_while_d2_count, default: 0
      t.integer :repeat_until_while_d3_count, default: 0
      t.integer :repeat_until_while_d4_count, default: 0
      t.integer :repeat_until_while_d5_count, default: 0
      t.integer :for_loops_d1_count, default: 0
      t.integer :for_loops_d2_count, default: 0
      t.integer :for_loops_d3_count, default: 0
      t.integer :for_loops_d4_count, default: 0
      t.integer :for_loops_d5_count, default: 0
      t.integer :events_d1_count, default: 0
      t.integer :events_d2_count, default: 0
      t.integer :events_d3_count, default: 0
      t.integer :events_d4_count, default: 0
      t.integer :events_d5_count, default: 0
      t.integer :variables_d1_count, default: 0
      t.integer :variables_d2_count, default: 0
      t.integer :variables_d3_count, default: 0
      t.integer :variables_d4_count, default: 0
      t.integer :variables_d5_count, default: 0
      t.integer :functions_d1_count, default: 0
      t.integer :functions_d2_count, default: 0
      t.integer :functions_d3_count, default: 0
      t.integer :functions_d4_count, default: 0
      t.integer :functions_d5_count, default: 0
      t.integer :functions_with_params_d1_count, default: 0
      t.integer :functions_with_params_d2_count, default: 0
      t.integer :functions_with_params_d3_count, default: 0
      t.integer :functions_with_params_d4_count, default: 0
      t.integer :functions_with_params_d5_count, default: 0
      t.integer :conditionals_d1_count, default: 0
      t.integer :conditionals_d2_count, default: 0
      t.integer :conditionals_d3_count, default: 0
      t.integer :conditionals_d4_count, default: 0
      t.integer :conditionals_d5_count, default: 0
    end
  end
end
