class AddRequesterToLearningGoalAiEvaluation < ActiveRecord::Migration[6.1]
  def change
    add_column :learning_goal_ai_evaluations, :requester_id, :integer, limit: 4
    add_foreign_key :learning_goal_ai_evaluations, :users, column: :requester_id, name: 'index_learning_goal_ai_evaluations_on_requester_id'
  end
end
