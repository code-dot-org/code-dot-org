class CreatePracticeProblems < ActiveRecord::Migration[7.0]
  def change
    create_table :practice_problems do |t|
      t.string :key, null: false
      t.string :problem_type, null: false
      t.boolean :active, default: false, null: false
      t.text :problem_text, null: false
      t.json :solution

      t.timestamps
    end

    create_join_table :practice_problems, :objectives do  |t|
      t.index [:practice_problem_id, :objective_id], unique: true, name: 'index_practice_prob_objectives_on_prob_and_objective_ids'
      t.index [:objective_id, :practice_problem_id], unique: true, name: 'index_practice_prob_objectives_on_objective_and_prob_ids'
    end
  end
end
