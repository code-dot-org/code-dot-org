class DropLearningGoalEvaluations < ActiveRecord::Migration[6.1]
  def change
    drop_table :learning_goal_evaluations if ActiveRecord::Base.connection.table_exists? :learning_goal_evaluations
  end
end
