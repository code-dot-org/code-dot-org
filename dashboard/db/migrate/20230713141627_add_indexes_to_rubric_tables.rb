class AddIndexesToRubricTables < ActiveRecord::Migration[6.1]
  def change
    add_index :rubrics, :lesson_id, unique: true
    add_index :rubrics, :level_id
    add_index :learning_goals, [:rubric_id, :key], unique: true
    add_index :learning_goal_evidence_levels, [:learning_goal_id, :understanding], unique: true, name: 'index_learning_goal_evidence_levels_on_lg_id_and_understanding'
  end
end
