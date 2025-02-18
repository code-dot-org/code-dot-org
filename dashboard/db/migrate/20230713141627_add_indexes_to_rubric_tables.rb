class AddIndexesToRubricTables < ActiveRecord::Migration[6.1]
  def change
    add_index :rubrics, [:lesson_id, :level_id], unique: true
    add_index :learning_goals, [:rubric_id, :key], unique: true
    add_index :learning_goal_evidence_levels, [:learning_goal_id, :understanding], unique: true, name: 'index_learning_goal_evidence_levels_on_lg_id_and_understanding'

    change_column_null :rubrics, :lesson_id, false
    change_column_null :rubrics, :level_id, false
    change_column_null :learning_goals, :rubric_id, false
    change_column_null :learning_goals, :key, false
    change_column_null :learning_goal_evidence_levels, :learning_goal_id, false
    change_column_null :learning_goal_evidence_levels, :understanding, false
  end
end
