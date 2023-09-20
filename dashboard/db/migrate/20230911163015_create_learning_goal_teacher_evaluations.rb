class CreateLearningGoalTeacherEvaluations < ActiveRecord::Migration[6.1]
  def change
    create_table :learning_goal_teacher_evaluations do |t|
      t.integer :user_id, null: false
      t.integer :teacher_id, null: false
      t.integer :learning_goal_id, null: false
      t.integer :understanding, null: false
      t.text :feedback
      t.datetime :submitted_at

      t.timestamps

      t.index :learning_goal_id
      t.index [:user_id, :teacher_id], name: 'index_learning_goal_teacher_evaluations_on_user_and_teacher_id'
    end
  end
end
