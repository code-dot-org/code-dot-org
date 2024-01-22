class CreateLearningGoalAiEvaluationFeedback < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_ai_evaluation_feedbacks do |t|
      t.bigint :learning_goal_ai_evaluation_id, index: {unique: false, name: 'index_feedback_on_learning_goal_ai_evaluation'}, null: false
      t.bigint :teacher_id, null: false
      t.boolean :ai_feedback_approval, null: false
      t.boolean :false_positive
      t.boolean :false_negative
      t.boolean :vague
      t.boolean :feedback_other
      t.text :other_content

      t.timestamps
    end
  end
end
